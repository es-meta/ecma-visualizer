import clsx from "clsx";
import { useEffect, useState } from "react";

type GrammarFeaturePair = {
  grammar: Element;
  feature: string;
};

const FeatureViewer = ({
  features,
  selectedFeature,
  handleFeatureChange,
  convertToECMAId,
}: {
  features?: string[];
  selectedFeature?: string;
  handleFeatureChange: (feature: string) => void;
  convertToECMAId: (ESMetaAlg: string) => Promise<string>;
}) => {
  const [grammarFeaturePairs, setGrammarFeaturePairs] = useState<
    GrammarFeaturePair[] | null
  >(null);

  useEffect(() => {
    if (!features) return;

    (async () => {
      const ecmaIds = Object.fromEntries(
        await Promise.all(
          features.map(async (feature) => {
            const ecmaId = await convertToECMAId(feature);
            return [ecmaId, feature];
          }),
        ),
      );

      const gfps = Object.keys(ecmaIds).reduce((acc, ecmaId: string) => {
        const $emuAlg = document.querySelector(`[visId="${ecmaId}"]`);

        if ($emuAlg?.previousElementSibling) {
          acc.push({
            grammar: $emuAlg.previousElementSibling,
            feature: ecmaIds[ecmaId],
          });
        }
        return acc;
      }, [] as GrammarFeaturePair[]);

      setGrammarFeaturePairs(gfps);
    })();
  }, [features]);

  if (!features || grammarFeaturePairs === null) return <div />;

  return (
    <div className="p-3 m-0 flex flex-col gap-1">
      {grammarFeaturePairs.map((gf) => (
        <button
          key={crypto.randomUUID()}
          className={clsx(
            "w-full hover:bg-neutral-300 cursor-pointer bg-white border border-neutral-300 rounded-md text-sm py-1 px-2",
            selectedFeature === gf.feature && "!bg-neutral-400",
          )}
          onClick={(e) => {
            e.preventDefault();
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
