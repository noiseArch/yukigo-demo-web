import { InspectionRule } from "../ast/inspector.js";
import { YukigoPrimitive } from "yukigo-core";
/**
 * Translates Mulang inspections (YAML format) to an array of `InspectionRule` objects.
 * @param mulangYamlString The Mulang inspection syntax as a YAML string.
 * @returns An array of InspectionRule objects.
 */
export declare function translateMulangToInspectionRules(mulangYamlString: string): InspectionRule[];
export declare const yukigoTsMappings: {
    [key in YukigoPrimitive]: string;
};
