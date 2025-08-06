import { useState } from "react";
import "./App.css";
import { ASTAnalyzer } from "yukigo";
import { YukigoHaskellParser } from "yukigo-haskell-parser";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-haskell";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-dark.css"; //Example style, you can use another

function App() {
  const [code, setCode] = useState<string>(
    `type Number = Int\r\n\r\ndoble :: Number -> Number\r\ndoble x = x * 2`
  );
  const [expectations, setExpectations] = useState<string>(
    '[\n\t{\n\t\t"inspection": "HasBinding",\n\t\t"args": {"name": "doble"},\n\t\t"expected": true\n\t},\n\t{\n\t\t"inspection": "UsesGuards",\n\t\t"args": {"name": "doble"},\n\t\t"expected": false\n\t}\n]'
  );
  const [results, setResults] = useState<string>("");
  const [parserOutput, setParserOutput] = useState<string>("");

  const runExpectations = () => {
    const parser = new YukigoHaskellParser();
    try {
      const ast = parser.parse(code);
      setParserOutput(parser.errors ? parser.errors.join("\n\n") : "");
      const analyser = new ASTAnalyzer(ast);
      const exp = JSON.parse(expectations);
      const result = analyser.analyze(exp);
      setResults(JSON.stringify(result, null, 2));
    } catch (error) {
      setParserOutput(parser.errors ? parser.errors.join("\n\n") : "");
    }
  };
  return (
    <main className="bg-zinc-700 text-white w-full h-full min-h-screen p-18 flex flex-col gap-16">
      <h1 className="text-3xl font-medium">Yukigo Demo Web</h1>
      <div className="flex w-full h-full gap-8">
        <div className="flex flex-col h-full w-full gap-4">
          <div className="flex flex-col h-1/2 gap-2">
            <h2 className="text-xl">Haskell Code</h2>
            <Editor
              value={code}
              onValueChange={(code) => setCode(code)}
              highlight={(code) => highlight(code, languages.hs, "haskell")}
              padding={10}
              className="bg-zinc-800 border-none h-full"
            />
          </div>
          <div className="flex flex-col h-1/2 gap-2">
            <h2 className="text-xl">Expectations</h2>
            <div className="">
              <Editor
                value={expectations}
                onValueChange={(code) => setExpectations(code)}
                highlight={(code) => highlight(code, languages.json, "json")}
                padding={10}
                className="bg-zinc-800 border-none h-full"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col h-full w-full gap-8">
          <div className="flex flex-col h-1/2 w-full gap-2">
            <div className="flex w-full justify-between items-center">
              <h2 className="text-xl">Results</h2>
              <button
                onClick={() => runExpectations()}
                className="bg-cyan-200 text-black px-2 py-1 text-bold rounded-lg cursor-pointer">
                Run expectations
              </button>
            </div>
            <Editor
              value={results}
              disabled
              onValueChange={() => {}}
              highlight={(code) => highlight(code, languages.json, "json")}
              padding={10}
              className="bg-zinc-800 border-none h-full"
            />
          </div>
          <div className="flex flex-col h-1/2 w-full gap-2">
            <h2 className="text-xl">Parser Output</h2>
            <Editor
              value={parserOutput}
              disabled
              onValueChange={() => {}}
              highlight={(code) => highlight(code, languages.text, "text")}
              padding={10}
              className="bg-zinc-800 border-none h-full"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
