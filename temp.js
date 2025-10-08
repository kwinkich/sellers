export default class TimePicker {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) {
      throw new Error('TimePicker container not found');
    }

    // Default options
    this.options = {
      defaultTime: '12:00',
      placeholder: 'Select time',
      onChange: null,
      ...options,
    };

    // Wheel configuration
    this.visibleItems = 7; // Number of visible items
    this.centerIndex = 3; // Center item index (0-indexed, so 4th item)

    // Current wheel positions (center item values)
    this.currentHour = 12;
    this.currentMinute = 0;

    // Scroll tracking
    this.isScrolling = false;
    this.scrollTimeouts = new Map();

    this.isOpen = false;
    this.isManualInput = false;

    this.init();
  }

  init() {
    this.isManualInput = false;
    this.originalValue = null;
    this.digitPosition = 0;
    this.render();
    this.bindEvents();

    // Set initial time if provided
    if (this.options.defaultTime) {
      this.setTime(this.options.defaultTime);
    }
  }

  render() {
    const uniqueId = Math.random().toString(36).substr(2, 9);
    const buttonId = `timepicker-button-${uniqueId}`;
    const dropdownId = `timepicker-dropdown-${uniqueId}`;

    this.container.innerHTML = `
      <div class="timepicker-container">
        <input
          id="${buttonId}"
          type="text"
          class="timepicker-input"
          placeholder="${this.options.placeholder}"
          readonly
        />
        <div id="${dropdownId}" class="timepicker-dropdown">
          <div class="timepicker-content">
            <div class="timepicker-wheels">
              <div class="timepicker-wheel" data-type="hour">
                <div class="timepicker-wheel-container" data-wheel="hour">
                  <!-- Items will be rendered here -->
                </div>
              </div>
              <div class="timepicker-separator">:</div>
              <div class="timepicker-wheel" data-type="minute">
                <div class="timepicker-wheel-container" data-wheel="minute">
                  <!-- Items will be rendered here -->
                </div>
              </div>
            </div>
            <div class="timepicker-center-indicator"></div>
          </div>
        </div>
      </div>
    `;

    // Store references
    this.input = this.container.querySelector(`#${buttonId}`);
    this.dropdown = this.container.querySelector(`#${dropdownId}`);
    this.hourWheel = this.container.querySelector('[data-wheel="hour"]');
    this.minuteWheel = this.container.querySelector('[data-wheel="minute"]');

    // Initial render of wheels
    this.renderWheel('hour');
    this.renderWheel('minute');
    this.updateInputValue();
  }

  renderWheel(type) {
    const wheel = type === 'hour' ? this.hourWheel : this.minuteWheel;
    const currentValue = type === 'hour' ? this.currentHour : this.currentMinute;
    const maxValue = type === 'hour' ? 23 : 59;

    // Calculate which 7 values to show
    const visibleValues = this.getVisibleValues(currentValue, maxValue);

    // Clear and render items
    wheel.innerHTML = '';
    visibleValues.forEach((value, index) => {
      const item = document.createElement('div');
      item.className = `timepicker-wheel-item ${index === this.centerIndex ? 'selected' : ''}`;
      item.textContent = value.toString().padStart(2, '0');
      item.dataset.value = value;
      item.dataset.index = index;
      item.dataset.type = type;

      // Add click event listener for non-center items
      if (index !== this.centerIndex) {
        item.addEventListener('click', e => {
          this.handleWheelItemClick(e);
        });
        // Add visual feedback for clickable items
        item.classList.add('cursor-pointer');
      }

      wheel.appendChild(item);
    });
  }

  getVisibleValues(centerValue, maxValue) {
    const values = [];
    const halfItems = Math.floor(this.visibleItems / 2);

    for (let i = -halfItems; i <= halfItems; i++) {
      let value = centerValue + i;

      // Handle infinite loop of the wheels
      if (value < 0) {
        value = maxValue + 1 + value;
      } else if (value > maxValue) {
        value = value - (maxValue + 1);
      }

      values.push(value);
    }

    return values;
  }

  bindEvents() {
    // Input click to toggle dropdown
    this.input.addEventListener('click', e => {
      e.stopPropagation();
      if (!this.isManualInput) {
        this.toggle();
      }
    });

    // Double-click to enable manual input
    this.input.addEventListener('dblclick', e => {
      e.stopPropagation();
      this.enableManualInput();
    });

    // Handle manual input
    this.input.addEventListener('keydown', e => {
      if (this.isManualInput) {
        this.handleManualInput(e);
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle();
        } else if (e.key === 'Escape') {
          this.close();
        }
      }
    });

    // Handle manual input blur
    this.input.addEventListener('blur', () => {
      if (this.isManualInput) {
        this.disableManualInput();
      }
    });

    // Wheel scroll events
    this.hourWheel.addEventListener('wheel', e => {
      e.preventDefault();
      this.handleWheelScroll('hour', e.deltaY);
    });

    this.minuteWheel.addEventListener('wheel', e => {
      e.preventDefault();
      this.handleWheelScroll('minute', e.deltaY);
    });

    // Touch/drag support for mobile
    this.bindTouchEvents();

    // Close on outside click
    document.addEventListener('click', e => {
      if (this.isOpen && !this.container.contains(e.target)) {
        this.close();
      }
    });

    // Prevent dropdown from closing when clicking inside
    this.dropdown.addEventListener('click', e => {
      e.stopPropagation();
    });
  }

  enableManualInput() {
    this.isManualInput = true;
    this.originalValue = this.input.value; // Store original value
    this.digitPosition = 0; // Track which digit we're replacing (0-3 for HHMM)

    this.input.removeAttribute('readonly');
    this.input.style.cursor = 'text';
    this.input.focus();
    this.input.select(); // Select all text
    this.close(); // Close dropdown if open
  }

  disableManualInput() {
    this.isManualInput = false;
    this.input.setAttribute('readonly', 'true');
    this.input.style.cursor = 'pointer';

    // Parse and validate the manual input
    this.validateAndApplyManualInput();

    // Clean up
    this.originalValue = null;
    this.digitPosition = 0;
  }

  handleManualInput(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.disableManualInput();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      // Restore original value
      this.input.value = this.originalValue;
      this.disableManualInput();
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (this.digitPosition > 0) {
        this.digitPosition--;
        this.restoreDigitAtPosition(this.digitPosition);
      }
      return;
    }

    // Allow delete, arrow keys, tab (but handle them specially)
    if (['Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.key)) {
      e.preventDefault();
      return;
    }

    // Only allow digits
    if (!/\d/.test(e.key)) {
      e.preventDefault();
      return;
    }

    // Handle digit input - replace from left to right
    if (/\d/.test(e.key)) {
      e.preventDefault();
      this.replaceDigitAtPosition(e.key);
    }
  }

  replaceDigitAtPosition(digit) {
    if (this.digitPosition >= 4) {
      return; // All positions filled
    }

    const currentValue = this.input.value;
    const digits = currentValue.replace(/[^\d]/g, ''); // Extract current digits

    // Create new digit string by replacing at current position
    let newDigits = digits.padEnd(4, '0'); // Ensure we have 4 digits
    newDigits =
      newDigits.substring(0, this.digitPosition) +
      digit +
      newDigits.substring(this.digitPosition + 1);

    // Format as HH:MM
    const formatted = `${newDigits.substring(0, 2)}:${newDigits.substring(2, 4)}`;
    this.input.value = formatted;

    // Move to next position
    this.digitPosition++;

    // Set cursor position for visual feedback
    this.setCursorForPosition();
  }

  restoreDigitAtPosition(position) {
    // Get original digits
    const originalDigits = this.originalValue.replace(/[^\d]/g, '').padEnd(4, '0');
    const currentValue = this.input.value;
    const currentDigits = currentValue.replace(/[^\d]/g, '').padEnd(4, '0');

    // Restore the digit at the specified position from original
    let newDigits =
      currentDigits.substring(0, position) +
      originalDigits[position] +
      currentDigits.substring(position + 1);

    // Format as HH:MM
    const formatted = `${newDigits.substring(0, 2)}:${newDigits.substring(2, 4)}`;
    this.input.value = formatted;

    // Set cursor position
    this.setCursorForPosition();
  }

  setCursorForPosition() {
    let cursorPos = this.digitPosition;

    if (this.digitPosition >= 2) cursorPos += 1;

    setTimeout(() => {
      this.input.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  }

  validateAndApplyManualInput() {
    const inputValue = this.input.value;
    const timeRegex = /^(\d{2}):(\d{2})$/;
    const match = inputValue.match(timeRegex);

    if (match) {
      const hour = parseInt(match[1]);
      const minute = parseInt(match[2]);

      // Validate ranges
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        // Valid time - update the picker
        this.currentHour = hour;
        this.currentMinute = minute;
        this.renderWheel('hour');
        this.renderWheel('minute');
        this.updateInputValue();
        return;
      }
    }

    // Invalid input - restore original value
    this.input.value = this.originalValue;
  }

  bindTouchEvents() {
    ['hour', 'minute'].forEach(type => {
      const wheel = type === 'hour' ? this.hourWheel : this.minuteWheel;
      let startY = 0;
      let currentY = 0;
      let isDragging = false;

      wheel.addEventListener('touchstart', e => {
        startY = e.touches[0].clientY;
        isDragging = true;
      });

      wheel.addEventListener('touchmove', e => {
        if (!isDragging) return;
        e.preventDefault();

        currentY = e.touches[0].clientY;
        const deltaY = startY - currentY;

        if (Math.abs(deltaY) > 10) {
          this.handleWheelScroll(type, deltaY > 0 ? 100 : -100);
          startY = currentY;
        }
      });

      wheel.addEventListener('touchend', () => {
        isDragging = false;
      });
    });
  }

  handleWheelScroll(type, deltaY) {
    const isHour = type === 'hour';
    const maxValue = isHour ? 23 : 59;
    const currentValue = isHour ? this.currentHour : this.currentMinute;

    // Determine scroll direction
    const scrollingDown = deltaY > 0;
    let newValue;

    if (scrollingDown) {
      newValue = currentValue === maxValue ? 0 : currentValue + 1;
    } else {
      newValue = currentValue === 0 ? maxValue : currentValue - 1;
    }

    // Update current value
    if (isHour) {
      this.currentHour = newValue;
    } else {
      this.currentMinute = newValue;
    }

    // Re-render the wheel
    this.renderWheel(type);

    // Clear existing timeout
    if (this.scrollTimeouts.has(type)) {
      clearTimeout(this.scrollTimeouts.get(type));
    }

    // Set timeout to update input after scrolling stops
    this.scrollTimeouts.set(
      type,
      setTimeout(() => {
        this.updateInputValue();
      }, 100),
    );
  }

  handleWheelItemClick(event) {
    const clickedValue = parseInt(event.target.dataset.value);
    const type = event.target.dataset.type;

    // Update the current value
    if (type === 'hour') {
      this.currentHour = clickedValue;
    } else {
      this.currentMinute = clickedValue;
    }

    // Re-render the wheel to show new selection
    this.renderWheel(type);

    // Update input value
    this.updateInputValue();
  }

  updateInputValue() {
    const timeString = this.getTimeString();
    this.input.value = timeString;

    // Trigger onChange callback
    if (this.options.onChange && typeof this.options.onChange === 'function') {
      this.options.onChange(timeString, {
        hour: this.currentHour,
        minute: this.currentMinute,
      });
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.dropdown.classList.add('show');
    this.isOpen = true;
  }

  close() {
    this.dropdown.classList.remove('show');
    this.isOpen = false;
  }

  setTime(timeString) {
    const [hourStr, minuteStr] = timeString.split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);

    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      this.currentHour = hour;
      this.currentMinute = minute;

      // Re-render wheels and update input
      this.renderWheel('hour');
      this.renderWheel('minute');
      this.updateInputValue();
    }
  }

  getTime() {
    return {
      timeString: this.getTimeString(),
      hour: this.currentHour,
      minute: this.currentMinute,
    };
  }

  getTimeString() {
    const hour = this.currentHour.toString().padStart(2, '0');
    const minute = this.currentMinute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  }

  destroy() {
    // Clear timeouts
    this.scrollTimeouts.forEach(timeout => clearTimeout(timeout));
    this.scrollTimeouts.clear();

    // Clean up DOM
    this.container.innerHTML = '';
  }

  // Static method for easy initialization
  static init(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    const instances = [];

    elements.forEach(element => {
      instances.push(new TimePicker(element, options));
    });

    return instances.length === 1 ? instances[0] : instances;
  }
}
