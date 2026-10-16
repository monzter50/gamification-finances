import { useReducer } from "react";

import {
  initialXlsxState,
  xlsxReducer,
} from "@/features/transactions/xlsx-import/model/xlsx-reducer";

/** Review-step state for one workbook import (pure reducer in model/). */
export const useXlsxReducer = () => useReducer(xlsxReducer, initialXlsxState);
