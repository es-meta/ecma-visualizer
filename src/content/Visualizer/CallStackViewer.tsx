import { useEffect, useState } from "react";
import { Loading } from "../App.tsx";

const CallStackViewer = ({
  callStack,
  convertCallIdToAlgoOrSyntax,
  deleteStack,
}: {
  callStack: number[];
  convertCallIdToAlgoOrSyntax: (
    callId: string,
  ) => Promise<[string, string] | [null, null]>;
  deleteStack: (idx: number) => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [algorithms, setAlgorithms] = useState<string[][] | null>(null);

  useEffect(() => {
    (async () => {
      const promises = callStack.map((cs) =>
        convertCallIdToAlgoOrSyntax(cs.toString()),
      );
      const algs = (await Promise.all(promises)).map((algNStep) => {
        const [alg, step] = algNStep;
        return alg === null ? ["not found", "-1"] : [alg, step];
      });
      setAlgorithms(algs);
      setLoading(false);
    })();
  }, [callStack]);

  return (
    <table className="">
      {loading && <Loading />}
      <thead>
        <tr>
          <th>name</th>
          <th>step</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {algorithms &&
          algorithms.map((algoNstep, idx) => {
            const [algos, step] = algoNstep;

            return (
              <tr>
                <td>
                  <Algorithm algorithm={algos} />
                </td>
                <td>{`step ${step}`}</td>
                <td>
                  <button onClick={() => deleteStack(idx)}>x</button>
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};

const Algorithm = ({ algorithm }: { algorithm: string }) => {
  if (algorithm.includes("emu-nt"))
    return (
      <p
        className="m-0 p-0 text-left text-sm"
        dangerouslySetInnerHTML={{
          __html: `<emu-production collapsed>${algorithm}</emu-production>`,
        }}
      />
    );
  else
    return (
      <h1
        className="m-0 p-0 text-left text-sm"
        dangerouslySetInnerHTML={{ __html: algorithm }}
      />
    );
};

export default CallStackViewer;
