import { ElementType, ReactNode, useEffect, useState } from "react";
import { Code, Route, FlaskConical, Play } from "lucide-react";
import ProgramViewer from "./ProgramViewer.tsx";
import { ProgramResponse } from "../../types/message.ts";
import FeatureViewer from "./FeatureViewer.tsx";

const Visualizer = () => {
  const [data, setData] = useState<ProgramResponse | null>(null);
  const [currentProgram, setCurrentProgram] = useState<string | null>(null);

  const [features, setFeatures] = useState<string[] | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const handleFeatureChange = (feature: string) => {
    setCurrentProgram(data?.programs?.[feature] || null);
    setSelectedFeature(feature);
  };

  useEffect(() => {
    const handleChange = (e: CustomEvent<ProgramResponse>) => {
      setData(e.detail);
      setFeatures(Object.keys(e.detail.programs));
    };

    window.addEventListener("custom", handleChange as EventListener);

    return () => {
      window.removeEventListener("custom", handleChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (features) handleFeatureChange(features[0]);
  }, [features]);

  return (
    <div className="w-full flex flex-row justify-start p-3 gap-4 min-h-0 flex-auto">
      <Card disabled={!currentProgram}>
        <CardHeader title="Program" icon={Code}>
          <div className="cursor-pointer hover:scale-95 text-blue-600 text-sm flex flex-row gap-1 items-center">
            Run on Web Debugger
            <Play size={12} />
          </div>
        </CardHeader>
        <section className="overflow-scroll grow-1 shrink-1 basis-auto">
          <ProgramViewer program={currentProgram ?? undefined} />
        </section>
      </Card>
      <Card disabled={!features}>
        <CardHeader title="Language Feature" icon={Route} />
        <section className="overflow-scroll grow-1 shrink-1 basis-auto">
          <FeatureViewer
            selectedFeature={selectedFeature ?? undefined}
            features={features ?? undefined}
            handleFeatureChange={handleFeatureChange}
          />
        </section>
      </Card>
      <Card disabled={!features}>
        <CardHeader title="Test262" icon={FlaskConical} />
      </Card>
      <Card disabled={!features}>
        <CardHeader title="Test262" icon={FlaskConical} />
      </Card>
    </div>
  );
};

const Card = ({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled: boolean;
}) => {
  return (
    <div className="relative min-w-[350px] min-h-0 overflow-hidden divide-neutral-300 divide-y bg-white rounded-xl border border-neutral-300 flex flex-col">
      {children}
      {disabled && (
        <div className="absolute top-0 left-0 size-full bg-neutral-200 opacity-70 flex justify-center items-center">
          <p>Disabled</p>
        </div>
      )}
    </div>
  );
};

const CardHeader = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ElementType;
  children?: ReactNode;
}) => {
  return (
    <header className="flex flex-row justify-between items-center px-3 grow-0 shrink-0 basis-auto">
      <h3 className="text-sm pt-2.5 pb-2 m-0 font-500 text-neutral-600 flex flex-row items-center justify-start gap-1 line-clamp-1">
        <Icon size={16} />
        {title}
      </h3>
      {children}
    </header>
  );
};

export default Visualizer;
