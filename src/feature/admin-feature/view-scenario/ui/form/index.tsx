import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { scenariosQueryOptions } from "@/entities";
import { getRoleLabel } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ViewBlocksContainer } from "./ViewBlocksContainer";
import { useState, useEffect } from "react";
import WebApp from '@twa-dev/sdk';

interface ViewScenarioFormProps {
  scenarioId?: number;
}

export function ViewScenarioForm({ scenarioId }: ViewScenarioFormProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"SELLER" | "BUYER" | "MODERATOR">("SELLER");

  // Fetch scenario data
  const { data: scenarioData, isLoading, isError } = useQuery({
    ...scenariosQueryOptions.byId(scenarioId!, true), // includeForms = true
    enabled: !!scenarioId,
  });

  // Telegram back button handler
  useEffect(() => {
    const onTelegramBack = () => {
      if (activeTab !== "SELLER") {
        handlePrevTab();
      } else {
        navigate("/admin/scenarios");
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
    if (activeTab === "SELLER") {
      setActiveTab("BUYER");
    } else if (activeTab === "BUYER") {
      setActiveTab("MODERATOR");
    }
  };

  const handlePrevTab = () => {
    if (activeTab === "BUYER") {
      setActiveTab("SELLER");
    } else if (activeTab === "MODERATOR") {
      setActiveTab("BUYER");
    }
  };

  const handleExit = () => {
    navigate("/admin/scenarios");
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
  const sellerForm = scenario.forms.find(f => f.role === "SELLER");
  const buyerForm = scenario.forms.find(f => f.role === "BUYER");
  const moderatorForm = scenario.forms.find(f => f.role === "MODERATOR");

  return (
    <div className="space-y-4">
      {/* Tabs for different roles */}
      <Tabs value={activeTab}>
        <TabsList variant="second" className="grid grid-cols-3 w-full pointer-events-none">
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

        <TabsContent
          value="SELLER"
          className="pt-3 data-[state=inactive]:hidden"
          forceMount
        >
          <ViewBlocksContainer
            blocks={sellerForm?.blocks || []}
            role="SELLER"
          />
        </TabsContent>
        <TabsContent
          value="BUYER"
          className="pt-3 data-[state=inactive]:hidden"
          forceMount
        >
          <ViewBlocksContainer
            blocks={buyerForm?.blocks || []}
            role="BUYER"
          />
        </TabsContent>
        <TabsContent
          value="MODERATOR"
          className="pt-3 data-[state=inactive]:hidden"
          forceMount
        >
          <ViewBlocksContainer
            blocks={moderatorForm?.blocks || []}
            role="MODERATOR"
          />
        </TabsContent>
      </Tabs>

      {/* Navigation buttons based on active tab */}
      <div className="flex gap-2 mt-6">
        {activeTab === "SELLER" && (
          <Button 
            onClick={handleNextTab} 
            className="flex-1 h-12"
          >
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
            <Button 
              onClick={handleNextTab} 
              className="flex-1 h-12"
            >
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
  );
}
