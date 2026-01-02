import '../../ort-init'
import * as ort from 'onnxruntime-web/wasm'

import { ComputerAgent } from "./agent"
import { GameState } from "../gamestate"
import { modelName, modelCatalogue } from '../models';
import { tensorWrap } from "../encode";

export async function loadModel(name: modelName) {

  const base = import.meta.env.BASE_URL || "/pippins/";
  const modelUrl = `${base}models/${name}/simple_model_2.onnx`;
  console.log(modelUrl);
  const session = await ort.InferenceSession.create(modelUrl);
  console.log('output names:');
  console.log(session.outputNames);
  return session;
}


export const nnAgent = (name: modelName): ComputerAgent => ({
  chooseMove: async (gameState: GameState, legalMoveIndices: number[]) => {
    const model = await loadModel(name);

    const encoder = modelCatalogue[name].encoder;
    const inputArray = encoder.encode(gameState);
    const inputTensor = tensorWrap(inputArray);

    const feeds = { input: inputTensor };
    const results = await model.run(feeds);
    const output = results.output;

    if (!(output.data instanceof Float32Array)) {
      throw new Error("Unexpected output type");
    }
    const predictionData = output.data;
  
    const legalPredictions = predictionData.filter(
      (_value, index) => legalMoveIndices.includes(index)
    );
    // might want probabilities for frontend, but this should
    // be separate functionality
    const maxLegalPrediction = Math.max(...legalPredictions)

    const maxIndex = predictionData.indexOf(maxLegalPrediction);

    return maxIndex;
  }
});

