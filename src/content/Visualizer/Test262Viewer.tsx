const Test262Viewer = ({ selectedTest262 }: { selectedTest262: string[] }) => {
  return (
    <div className="p-3 m-0 flex flex-col gap-1 overflow-scroll">
      {selectedTest262.map((selectedTest262) => (
        <p>{selectedTest262}</p>
      ))}
    </div>
  );
};

export default Test262Viewer;
