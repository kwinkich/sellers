import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { scenariosQueryOptions } from "@/entities";
import { getRoleLabel } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ViewBlocksContainer } from "./ViewBlocksContainer";
import { useState, useEffect } from "react";
import WebApp from "@twa-dev/sdk";

interface ViewScenarioFormProps {
  scenarioId?: number;
}

export function ViewScenarioForm({ scenarioId }: ViewScenarioFormProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"SELLER" | "BUYER" | "MODERATOR">(
    "SELLER"
  );
  
  // Sub-tab state for each role: "scenario" or "evaluation"
  const [subTab, setSubTab] = useState<{
    SELLER: "scenario" | "evaluation";
    BUYER: "scenario" | "evaluation";
    MODERATOR: "scenario" | "evaluation";
  }>({
    SELLER: "scenario",
    BUYER: "scenario",
    MODERATOR: "scenario",
  });

  // Fetch scenario data
  const {
    data: scenarioData,
    isLoading,
    isError,
  } = useQuery({
    ...scenariosQueryOptions.byId(scenarioId!, true), // includeForms = true
    enabled: !!scenarioId,
  });

  // Telegram back button handler
  useEffect(() => {
    const onTelegramBack = () => {
      if (activeTab !== "SELLER") {
        handlePrevTab();
      } else {
        navigate("/admin/content/scenarios");
      }
    };

    if (WebApp?.BackButton) {
      WebApp.BackButton.onClick(onTelegramBack);
      WebApp.BackButton.show();

      return () => {
        try {
          WebApp.BackButton.offClick(onTelegramBack);
        } catch {}
      };
    }
  }, [activeTab, navigate]);

  const handleNextTab = () => {
    const currentSubTab = subTab[activeTab];

    // If on scenario sub-tab, move to evaluation sub-tab of same role
    if (currentSubTab === "scenario") {
      setSubTab((prev) => ({ ...prev, [activeTab]: "evaluation" }));
    } else {
      // If on evaluation sub-tab, move to next role's scenario sub-tab
      if (activeTab === "SELLER") {
        setActiveTab("BUYER");
        setSubTab((prev) => ({ ...prev, BUYER: "scenario" }));
      } else if (activeTab === "BUYER") {
        setActiveTab("MODERATOR");
        setSubTab((prev) => ({ ...prev, MODERATOR: "scenario" }));
      }
    }
  };

  const handlePrevTab = () => {
    const currentSubTab = subTab[activeTab];

    if (currentSubTab === "evaluation") {
      // Go back to scenario sub-tab of same role
      setSubTab((prev) => ({ ...prev, [activeTab]: "scenario" }));
    } else {
      // Go back to previous role's evaluation sub-tab
      if (activeTab === "BUYER") {
        setActiveTab("SELLER");
        setSubTab((prev) => ({ ...prev, SELLER: "evaluation" }));
      } else if (activeTab === "MODERATOR") {
        setActiveTab("BUYER");
        setSubTab((prev) => ({ ...prev, BUYER: "evaluation" }));
      }
    }
  };

  const handleExit = () => {
    navigate("/admin/content/scenarios");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Загрузка сценария...</span>
      </div>
    );
  }

  if (isError || !scenarioData?.data) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Ошибка загрузки сценария</p>
      </div>
    );
  }

  const scenario = scenarioData.data;
  
  // Split forms by role and type
  const sellerScenarioForm = scenario.forms.find((f) => f.role === "SELLER" && f.type === "SCENARIO");
  const sellerEvaluationForm = scenario.forms.find((f) => f.role === "SELLER" && f.type === "EVALUATION");
  const buyerScenarioForm = scenario.forms.find((f) => f.role === "BUYER" && f.type === "SCENARIO");
  const buyerEvaluationForm = scenario.forms.find((f) => f.role === "BUYER" && f.type === "EVALUATION");
  const moderatorScenarioForm = scenario.forms.find((f) => f.role === "MODERATOR" && f.type === "SCENARIO");
  const moderatorEvaluationForm = scenario.forms.find((f) => f.role === "MODERATOR" && f.type === "EVALUATION");

  return (
    <div className="space-y-4 min-h-0">
      {/* Tabs for different roles */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "SELLER" | "BUYER" | "MODERATOR")}>
        <div className="sticky top-0 bg-white z-50 pb-2">
          <TabsList
            variant="second"
            className="grid grid-cols-3 w-full"
          >
            <TabsTrigger variant="second" value="SELLER">
              {getRoleLabel("SELLER")}
            </TabsTrigger>
            <TabsTrigger variant="second" value="BUYER">
              {getRoleLabel("BUYER")}
            </TabsTrigger>
            <TabsTrigger variant="second" value="MODERATOR">
              {getRoleLabel("MODERATOR")}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="SELLER"
          className="pt-3 data-[state=inactive]:hidden"
          forceMount
        >
          <div className="overflow-visible min-h-0 space-y-4">
            <Tabs value={subTab.SELLER} onValueChange={(value) => setSubTab(prev => ({ ...prev, SELLER: value as "scenario" | "evaluation" }))}>
              <TabsList variant="second" className="grid grid-cols-2 w-full">
                <TabsTrigger variant="second" value="scenario">
                  Сценарный блок
                </TabsTrigger>
                <TabsTrigger variant="second" value="evaluation">
                  Оценочный блок
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scenario" className="mt-4">
                <ViewBlocksContainer
                  blocks={sellerScenarioForm?.blocks || []}
                  role="SELLER"
                />
              </TabsContent>

              <TabsContent value="evaluation" className="mt-4">
                <ViewBlocksContainer
                  blocks={sellerEvaluationForm?.blocks || []}
                  role="SELLER"
                />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
        <TabsContent
          value="BUYER"
          className="pt-3 data-[state=inactive]:hidden"
          forceMount
        >
          <div className="overflow-visible min-h-0 space-y-4">
            <Tabs value={subTab.BUYER} onValueChange={(value) => setSubTab(prev => ({ ...prev, BUYER: value as "scenario" | "evaluation" }))}>
              <TabsList variant="second" className="grid grid-cols-2 w-full">
                <TabsTrigger variant="second" value="scenario">
                  Сценарный блок
                </TabsTrigger>
                <TabsTrigger variant="second" value="evaluation">
                  Оценочный блок
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scenario" className="mt-4">
                <ViewBlocksContainer
                  blocks={buyerScenarioForm?.blocks || []}
                  role="BUYER"
                />
              </TabsContent>

              <TabsContent value="evaluation" className="mt-4">
                <ViewBlocksContainer
                  blocks={buyerEvaluationForm?.blocks || []}
                  role="BUYER"
                />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
        <TabsContent
          value="MODERATOR"
          className="pt-3 data-[state=inactive]:hidden"
          forceMount
        >
          <div className="overflow-visible min-h-0 space-y-4">
            <Tabs value={subTab.MODERATOR} onValueChange={(value) => setSubTab(prev => ({ ...prev, MODERATOR: value as "scenario" | "evaluation" }))}>
              <TabsList variant="second" className="grid grid-cols-2 w-full">
                <TabsTrigger variant="second" value="scenario">
                  Сценарный блок
                </TabsTrigger>
                <TabsTrigger variant="second" value="evaluation">
                  Оценочный блок
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scenario" className="mt-4">
                <ViewBlocksContainer
                  blocks={moderatorScenarioForm?.blocks || []}
                  role="MODERATOR"
                />
              </TabsContent>

              <TabsContent value="evaluation" className="mt-4">
                <ViewBlocksContainer
                  blocks={moderatorEvaluationForm?.blocks || []}
                  role="MODERATOR"
                />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>

      {/* Navigation buttons based on active tab */}
      <div className="pt-4 pb-4">
        <div className="flex gap-2">
          {activeTab === "SELLER" && (
            <Button onClick={handleNextTab} className="flex-1 h-12">
              Далее
            </Button>
          )}

          {activeTab === "BUYER" && (
            <>
              <Button
                onClick={handlePrevTab}
                variant="second"
                className="flex-1 h-12"
              >
                Назад
              </Button>
              <Button onClick={handleNextTab} className="flex-1 h-12">
                Далее
              </Button>
            </>
          )}

          {activeTab === "MODERATOR" && (
            <>
              <Button
                onClick={handlePrevTab}
                variant="second"
                className="flex-1 h-12"
              >
                Назад
              </Button>
              <Button
                onClick={handleExit}
                variant="second"
                className="flex-1 h-12"
              >
                Выйти
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
