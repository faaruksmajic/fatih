type SketchHeadingProps = {
  lines: string[];
  as?: "h1" | "h2";
  headingClassName?: string;
  wrapperClassName?: string;
};

export function SketchHeading({
  lines,
  as = "h2",
  headingClassName = "",
  wrapperClassName = "",
}: SketchHeadingProps) {
  const Tag = as;
  const [firstLine, ...restLines] = lines;
  const firstChar = firstLine.slice(0, 1);
  const restOfFirstLine = firstLine.slice(1);

  return (
    <div className={`sketch-heading ${wrapperClassName}`}>
      <Tag className={`font-display ${headingClassName}`}>
        <span className="sketch-letter">{firstChar}</span>
        {restOfFirstLine}
        {restLines.map((line, index) => (
          <span key={index}>
            <br />
            {line}
          </span>
        ))}
      </Tag>
    </div>
  );
}
