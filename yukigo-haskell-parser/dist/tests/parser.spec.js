import { YukigoHaskellParser } from "../src/index.js";
import { assert } from "chai";
import { char, expr, func, funcGroup, litPattern, location, number, position, str, typeCon, typeSig, } from "./builders.js";
describe("Parser Tests", () => {
    let parser;
    beforeEach(() => {
        parser = new YukigoHaskellParser();
    });
    it("parses literal character patterns", () => {
        assert.deepEqual(parser.parse("f :: Char -> Int\r\nf 'a' = 1"), [
            typeSig("f", location(position(1, 1, 0), position(1, 1, 1)), [typeCon("Char")], typeCon("Int")),
            funcGroup("f", location(position(2, 1, 18), position(2, 1, 19)), func([
                litPattern(char("'a'", location(position(2, 3, 20), position(2, 3, 23)))),
            ], expr(number(1, location(position(2, 9, 26), position(2, 9, 27)))), ["UnguardedBody"])),
        ]);
    });
    it("parses literal string patterns", () => {
        assert.deepEqual(parser.parse('f :: String -> Int\r\nf "hello world" = 1'), [
            typeSig("f", location(position(1, 1, 0), position(1, 1, 1)), [typeCon("String")], typeCon("Int")),
            funcGroup("f", location(position(2, 1, 20), position(2, 1, 21)), func([
                litPattern(str('"hello world"', location(position(2, 3, 22), position(2, 3, 35)))),
            ], expr(number(1, location(position(2, 19, 38), position(2, 19, 39)))), ["UnguardedBody"])),
        ]);
    });
    it("parses literal number patterns", () => {
        assert.deepEqual(parser.parse("f :: Int -> Int\r\nf 1 = 1"), [
            typeSig("f", location(position(1, 1, 0), position(1, 1, 1)), [typeCon("Int")], typeCon("Int")),
            funcGroup("f", location(position(2, 1, 17), position(2, 1, 18)), func([
                litPattern(number(1, location(position(2, 3, 19), position(2, 3, 20)))),
            ], expr(number(1, location(position(2, 7, 23), position(2, 7, 24)))), ["UnguardedBody"])),
        ]);
    });
    it("parses left infix partial application", () => {
        assert.deepEqual(parser.parse("f :: Int -> Int\r\nf = (1+)"), []);
    });
    it("parses right infix partial application", () => {
        assert.deepEqual(parser.parse("f :: Int -> Int\r\nf = (+1)"), []);
    });
});
