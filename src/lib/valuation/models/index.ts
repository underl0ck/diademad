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
import { dcf5yRevenueModel } from "./dcf-5y-revenue";
import { dcf5yEbitdaModel } from "./dcf-5y-ebitda";
import { dcf10yGrowthModel } from "./dcf-10y-growth";
import { dcf10yRevenueModel } from "./dcf-10y-revenue";
import { dcf10yEbitdaModel } from "./dcf-10y-ebitda";
import { evEbitModel } from "./ev-ebit";
import { dividendMultistageModel } from "./dividend-multistage";

export {
  dcfModel, peModel, ddmModel, fcffModel, fcfeModel,
  capEarningsModel, epvModel, residualIncomeModel, evaModel,
  dividendGrowthModel, psModel, pbModel, evEbitdaModel,
  compsModel, sumOfPartsModel, analystConsensusModel, adjustedNetAssetsModel,
  dcf5yRevenueModel, dcf5yEbitdaModel,
  dcf10yGrowthModel, dcf10yRevenueModel, dcf10yEbitdaModel,
  evEbitModel, dividendMultistageModel,
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
    dcf5yRevenueModel(f),
    dcf5yEbitdaModel(f),
    dcf10yGrowthModel(f),
    dcf10yRevenueModel(f),
    dcf10yEbitdaModel(f),
    evEbitModel(f),
    dividendMultistageModel(f),
  ];
}
