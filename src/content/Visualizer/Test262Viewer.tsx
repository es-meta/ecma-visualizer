const Test262Viewer = ({
  selectedTest262Set,
}: {
  selectedTest262Set: string[];
}) => {
  // const [selectedIdx, setSelectedIdx] = useState<number>(0);
  // const [test262, setTest262] = useState<string>("");
  // const [loading, setLoading] = useState(true);

  //ToDo current esmeta test262 version
  // useEffect(() => {
  //   (async () => {
  //     const prog = await fetch(
  //       `https://raw.githubusercontent.com/tc39/test262/3a7a72aef5009eb22117231d40f9a5a66a9a595a/test/${selectedTest262Set[selectedIdx]}`,
  //     );
  //     console.log("???");
  //     setTest262(await prog.text());
  //     setLoading(false);
  //   })();
  // }, [selectedIdx, selectedTest262Set]);

  return (
    <div className="m-0 flex flex-col gap-1 overflow-scroll p-3">
      {/*{loading ? <p>loading</p> : <pre className="text-xs">{test262}</pre>}*/}
      {selectedTest262Set.map((test262, idx) => (
        // <button onClick={() => setSelectedIdx(idx)}>{test262}</button>
        <a
          href={`https://raw.githubusercontent.com/tc39/test262/3a7a72aef5009eb22117231d40f9a5a66a9a595a/test/${selectedTest262Set[idx]}`}
          target="_blank"
        >
          {test262}
        </a>
      ))}
    </div>
  );
};

export default Test262Viewer;
