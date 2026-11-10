import type { Fundamentals, ModelResult } from "../types";

import { dcfModel } from "./dcf";
import { peModel } from "./pe";
import { ddmModel } from "./ddm";
import { fcffModel } from "./fcff";
import { fcfeModel } from "./fcfe";
import { capEarningsModel } from "./cap-earnings";
import { epvModel } from "./epv";
import { residualIncomeModel } from "./residual-income";
import { evaModel } from "./eva";
import { dividendGrowthModel } from "./dividend-growth";
import { psModel } from "./ps";
import { pbModel } from "./pb";
import { evEbitdaModel } from "./ev-ebitda";
import { compsModel } from "./comps";
import { sumOfPartsModel } from "./sum-of-parts";
import { analystConsensusModel } from "./analyst-consensus";
import { adjustedNetAssetsModel } from "./adjusted-net-assets";

export {
  dcfModel, peModel, ddmModel, fcffModel, fcfeModel,
  capEarningsModel, epvModel, residualIncomeModel, evaModel,
  dividendGrowthModel, psModel, pbModel, evEbitdaModel,
  compsModel, sumOfPartsModel, analystConsensusModel, adjustedNetAssetsModel,
};

export function runAllModels(f: Fundamentals): ModelResult[] {
  return [
    dcfModel(f),
    fcffModel(f),
    fcfeModel(f),
    capEarningsModel(f),
    epvModel(f),
    residualIncomeModel(f),
    evaModel(f),
    ddmModel(f),
    dividendGrowthModel(f),
    peModel(f),
    psModel(f),
    pbModel(f),
    evEbitdaModel(f),
    compsModel(f),
    sumOfPartsModel(f),
    analystConsensusModel(f),
    adjustedNetAssetsModel(f),
  ];
}
