const CallStackViewer = ({ callStack }: { callStack: number[] }) => {
  return (
    <div className="">
      {callStack.map((callId) => (
        <div>{callId}</div>
      ))}
    </div>
  );
};

export default CallStackViewer;
