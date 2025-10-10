import { API, type GResponse } from "@/shared";
import { getTelegramInitData } from "@/shared/lib/telegram";
import { pTimeout } from "@/shared/lib/pTimeout";
import type { AuthResponse } from "../types/auth.types";

export const AuthAPI = {
  authTelegram: () => {
    const initData = getTelegramInitData();
    if (!initData) {
      // В браузере (не в Telegram) можно подставить тестовые данные через DEV_TG_INIT_DATA
      throw new Error(
        "Телеграм initData пустой. Откройте приложение внутри Telegram или предоставьте DEV_TG_INIT_DATA для разработки."
      );
    }

    return pTimeout(
      API.post("auth/telegram", {
        json: { initData },
      }).json<GResponse<AuthResponse>>(),
      8000,
      "auth timeout"
    );
  },

  refreshTelegram: () =>  
    pTimeout(
      API.post("auth/refresh").json<GResponse<AuthResponse>>(),
      8000,
      "refresh timeout"
    ),
};
