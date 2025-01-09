import clsx from "clsx";

const FeatureViewer = ({
  currentFeatureList,
  selectedIdx,
  changeFeature,
}: {
  currentFeatureList: string[];
  selectedIdx: number;
  changeFeature: (idx: number) => void;
}) => {
  return (
    <div className="p-3 m-0 flex flex-col gap-1">
      {currentFeatureList.map((featureHTML, idx) => (
        <button
          key={crypto.randomUUID()}
          className={clsx(
            "text-left w-full hover:bg-neutral-200 cursor-pointer bg-white border border-neutral-300 rounded-md text-sm py-1 px-2",
            idx === selectedIdx && "!bg-neutral-300 cursor-default",
          )}
          onClick={() => {
            changeFeature(idx);
          }}
          dangerouslySetInnerHTML={{
            __html:
              "<emu-production collapsed>" + featureHTML + "</emu-production>",
          }}
        ></button>
      ))}
    </div>
  );
};

export default FeatureViewer;
