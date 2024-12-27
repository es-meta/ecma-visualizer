import clsx from "clsx";

type GrammarFeaturePair = {
  grammar: Element;
  feature: string;
};

const FeatureViewer = ({
  features,
  selectedFeature,
  handleFeatureChange,
}: {
  features?: string[];
  selectedFeature?: string;
  handleFeatureChange: (feature: string) => void;
}) => {
  if (!features) return <h1>ToDo</h1>;

  console.log("###", selectedFeature);

  const grammarFeaturePair: GrammarFeaturePair[] = features.reduce(
    (acc, feature: string) => {
      const $emuAlg = document.getElementById(feature);
      if ($emuAlg?.previousElementSibling) {
        acc.push({ grammar: $emuAlg.previousElementSibling, feature });
      }
      return acc;
    },
    [] as GrammarFeaturePair[],
  );

  return (
    <div className="p-3 m-0 flex flex-col gap-1">
      {grammarFeaturePair.map((gf) => (
        <button
          key={crypto.randomUUID()}
          className={clsx(
            "w-full hover:bg-neutral-300 cursor-pointer bg-white border border-neutral-300 rounded-md text-sm py-1 px-2",
            selectedFeature === gf.feature && "!bg-neutral-400",
          )}
          onClick={(e) => {
            e.preventDefault();
            console.log("@@@", gf.feature);
            handleFeatureChange(gf.feature);
          }}
          dangerouslySetInnerHTML={{
            __html: gf.grammar.outerHTML,
          }}
        ></button>
      ))}
    </div>
  );
};

export default FeatureViewer;
