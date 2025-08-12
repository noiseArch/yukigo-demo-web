import { parseDocument } from "yaml";
import { InspectionRule } from "../ast/inspector.js";
import { YukigoPrimitive } from "yukigo-core";

/**
 * Translates Mulang inspections (YAML format) to an array of `InspectionRule` objects.
 * @param mulangYamlString The Mulang inspection syntax as a YAML string.
 * @returns An array of InspectionRule objects.
 */
export function translateMulangToInspectionRules(
  mulangYamlString: string
): InspectionRule[] {
  const parsedYaml = parseDocument(mulangYamlString).toJS();

  if (
    !parsedYaml ||
    !parsedYaml.expectations ||
    !Array.isArray(parsedYaml.expectations)
  ) {
    throw Error(
      "Invalid Mulang YAML structure. Expected 'expectations' to be an array."
    );
  }

  const inspectionRules: InspectionRule[] = [];

  for (const mulangInspection of parsedYaml.expectations) {
    if (
      !mulangInspection ||
      typeof mulangInspection.inspection !== "string" ||
      typeof mulangInspection.binding !== "string"
    ) {
      throw Error(
        `Skipping malformed Mulang inspection entry: ${mulangInspection}`
      );
    }

    let inspectionName = mulangInspection.inspection;
    let expected = true;
    const args: Record<string, unknown> = { name: mulangInspection.binding };

    if (inspectionName.startsWith("Not:")) {
      expected = false;
      inspectionName = inspectionName.substring(4);
    }

    if (inspectionName.startsWith("Uses:")) {
      const usageArg = inspectionName.substring("Uses:".length);
      inspectionName = "Uses";
      args.usage = usageArg;
    }

    inspectionRules.push({
      inspection: inspectionName,
      args: args,
      expected: expected,
    });
  }

  return inspectionRules;
}

export const yukigoTsMappings: { [key in YukigoPrimitive]: string } = {
  YuNumber: "number",
  YuString: "string",
  YuChar: "char",
  YuBoolean: "boolean",
  YuNull: "null",
  YuUndefined: "undefined",
  YuList: "YuList",
  YuSymbol: "YuSymbol",
};
