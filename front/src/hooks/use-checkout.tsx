"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type {
  Bill,
  TipOption,
  TipState,
  PaymentMethod,
  PaymentState,
  CheckoutStep,
  SplitMode,
  SplitState,
} from "@/types/bill";
import { calculateTipAmount, calculateGrandTotal } from "@/lib/tip";
import { calculateEqualShare, calculateItemShare } from "@/lib/split";

/* ── State shape ── */

interface CheckoutState {
  step: CheckoutStep;
  tip: TipState;
  payment: PaymentState;
  split: SplitState;
}

/* ── Actions ── */

type CheckoutAction =
  | { type: "SET_STEP"; step: CheckoutStep }
  | { type: "SELECT_TIP"; option: TipOption; subtotal: number }
  | { type: "SET_CUSTOM_TIP"; amount: number }
  | { type: "SET_PAYMENT_METHOD"; method: PaymentMethod }
  | {
      type: "SET_PAYMENT_STATUS";
      status: PaymentState["status"];
      errorMessage?: string;
    }
  | { type: "SET_SPLIT_MODE"; mode: SplitMode; billTotal: number }
  | { type: "SET_EQUAL_HEAD_COUNT"; headCount: number; billTotal: number }
  | { type: "TOGGLE_CLAIM_ITEM"; itemId: string; bill: Bill }
  | { type: "TOGGLE_SHARED_ITEM"; itemId: string; bill: Bill }
  | { type: "SET_CUSTOM_AMOUNT"; amount: number }
  | { type: "CLEAR_SPLIT" }
  | { type: "RESET"; subtotal: number };

/* ── Reducer ── */

function checkoutReducer(
  state: CheckoutState,
  action: CheckoutAction
): CheckoutState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };

    case "SELECT_TIP": {
      if (action.option === "none") {
        return {
          ...state,
          tip: { option: "none", percentage: null, amount: 0 },
        };
      }
      if (action.option === "custom") {
        return {
          ...state,
          tip: { option: "custom", percentage: null, amount: state.tip.amount },
        };
      }
      const percentage = parseInt(action.option, 10);
      return {
        ...state,
        tip: {
          option: action.option,
          percentage,
          amount: calculateTipAmount(action.subtotal, percentage),
        },
      };
    }

    case "SET_CUSTOM_TIP":
      return {
        ...state,
        tip: { option: "custom", percentage: null, amount: action.amount },
      };

    case "SET_PAYMENT_METHOD":
      return {
        ...state,
        payment: { ...state.payment, method: action.method },
      };

    case "SET_PAYMENT_STATUS":
      return {
        ...state,
        payment: {
          ...state.payment,
          status: action.status,
          errorMessage: action.errorMessage,
        },
      };

    /* ── Split actions ── */

    case "SET_SPLIT_MODE": {
      if (action.mode === "none") {
        return { ...state, split: { mode: "none" } };
      }
      if (action.mode === "equal") {
        const { perPerson } = calculateEqualShare(action.billTotal, 2);
        return {
          ...state,
          split: { mode: "equal", headCount: 2, myShare: perPerson },
        };
      }
      if (action.mode === "by_item") {
        return {
          ...state,
          split: {
            mode: "by_item",
            claimedItemIds: [],
            sharedItemIds: [],
            myShare: 0,
          },
        };
      }
      // custom
      return {
        ...state,
        split: { mode: "custom", myAmount: 0 },
      };
    }

    case "SET_EQUAL_HEAD_COUNT": {
      const { perPerson } = calculateEqualShare(
        action.billTotal,
        action.headCount
      );
      return {
        ...state,
        split: {
          mode: "equal",
          headCount: action.headCount,
          myShare: perPerson,
        },
      };
    }

    case "TOGGLE_CLAIM_ITEM": {
      if (state.split.mode !== "by_item") return state;
      const claimed = state.split.claimedItemIds.includes(action.itemId)
        ? state.split.claimedItemIds.filter((id) => id !== action.itemId)
        : [...state.split.claimedItemIds, action.itemId];
      // Remove from shared if claiming
      const shared = state.split.sharedItemIds.filter(
        (id) => !claimed.includes(id)
      );
      const myShare = calculateItemShare(action.bill, claimed, shared);
      return {
        ...state,
        split: { mode: "by_item", claimedItemIds: claimed, sharedItemIds: shared, myShare },
      };
    }

    case "TOGGLE_SHARED_ITEM": {
      if (state.split.mode !== "by_item") return state;
      const isShared = state.split.sharedItemIds.includes(action.itemId);
      const shared = isShared
        ? state.split.sharedItemIds.filter((id) => id !== action.itemId)
        : [...state.split.sharedItemIds, action.itemId];
      // Remove from claimed if marking as shared
      const claimed = state.split.claimedItemIds.filter(
        (id) => !shared.includes(id)
      );
      const myShare = calculateItemShare(action.bill, claimed, shared);
      return {
        ...state,
        split: { mode: "by_item", claimedItemIds: claimed, sharedItemIds: shared, myShare },
      };
    }

    case "SET_CUSTOM_AMOUNT":
      return {
        ...state,
        split: { mode: "custom", myAmount: action.amount },
      };

    case "CLEAR_SPLIT":
      return { ...state, split: { mode: "none" } };

    case "RESET":
      return createInitialState(action.subtotal);

    default:
      return state;
  }
}

/* ── Initial state factory ── */

function createInitialState(subtotal: number): CheckoutState {
  return {
    step: "bill",
    tip: {
      option: "15",
      percentage: 15,
      amount: calculateTipAmount(subtotal, 15),
    },
    payment: {
      method: null,
      status: "idle",
    },
    split: { mode: "none" },
  };
}

/* ── Helper: get the payable amount based on split state ── */

function getPayableAmount(bill: Bill, split: SplitState): number {
  switch (split.mode) {
    case "equal":
      return split.myShare;
    case "by_item":
      return split.myShare;
    case "custom":
      return split.myAmount;
    default:
      return bill.total;
  }
}

/* ── Context value shape ── */

interface CheckoutContextValue {
  step: CheckoutStep;
  tip: TipState;
  payment: PaymentState;
  split: SplitState;
  grandTotal: number;
  payableAmount: number;
  setStep: (step: CheckoutStep) => void;
  selectTip: (option: TipOption) => void;
  setCustomTip: (amount: number) => void;
  startPayment: (method: PaymentMethod) => void;
  setSplitMode: (mode: SplitMode) => void;
  setEqualHeadCount: (headCount: number) => void;
  toggleClaimItem: (itemId: string) => void;
  toggleSharedItem: (itemId: string) => void;
  setCustomAmount: (amount: number) => void;
  clearSplit: () => void;
  reset: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

/* ── Provider ── */

interface CheckoutProviderProps {
  bill: Bill;
  children: ReactNode;
}

export function CheckoutProvider({ bill, children }: CheckoutProviderProps) {
  const [state, dispatch] = useReducer(
    checkoutReducer,
    bill.subtotal,
    createInitialState
  );

  const billRef = useRef(bill);
  useEffect(() => {
    billRef.current = bill;
  });

  const payableAmount = getPayableAmount(bill, state.split);
  const grandTotal = calculateGrandTotal(payableAmount, state.tip.amount);

  const setStep = useCallback(
    (step: CheckoutStep) => dispatch({ type: "SET_STEP", step }),
    []
  );

  // We need a version of selectTip that uses the payable amount
  const selectTipForSplit = useCallback(
    (option: TipOption, payable: number) =>
      dispatch({
        type: "SELECT_TIP",
        option,
        subtotal: payable,
      }),
    []
  );

  const setCustomTip = useCallback(
    (amount: number) => dispatch({ type: "SET_CUSTOM_TIP", amount }),
    []
  );

  const startPayment = useCallback((method: PaymentMethod) => {
    dispatch({ type: "SET_PAYMENT_METHOD", method });
    dispatch({ type: "SET_PAYMENT_STATUS", status: "processing" });

    // Simulate payment processing
    setTimeout(() => {
      dispatch({ type: "SET_PAYMENT_STATUS", status: "success" });
      dispatch({ type: "SET_STEP", step: "confirmation" });
    }, 2000);
  }, []);

  const setSplitMode = useCallback(
    (mode: SplitMode) =>
      dispatch({
        type: "SET_SPLIT_MODE",
        mode,
        billTotal: billRef.current.total,
      }),
    []
  );

  const setEqualHeadCount = useCallback(
    (headCount: number) =>
      dispatch({
        type: "SET_EQUAL_HEAD_COUNT",
        headCount,
        billTotal: billRef.current.total,
      }),
    []
  );

  const toggleClaimItem = useCallback(
    (itemId: string) =>
      dispatch({ type: "TOGGLE_CLAIM_ITEM", itemId, bill: billRef.current }),
    []
  );

  const toggleSharedItem = useCallback(
    (itemId: string) =>
      dispatch({ type: "TOGGLE_SHARED_ITEM", itemId, bill: billRef.current }),
    []
  );

  const setCustomAmount = useCallback(
    (amount: number) => dispatch({ type: "SET_CUSTOM_AMOUNT", amount }),
    []
  );

  const clearSplit = useCallback(
    () => dispatch({ type: "CLEAR_SPLIT" }),
    []
  );

  const reset = useCallback(
    () => dispatch({ type: "RESET", subtotal: billRef.current.subtotal }),
    []
  );

  // Wrapper for selectTip that accounts for split
  const selectTipWrapped = useCallback(
    (option: TipOption) => {
      selectTipForSplit(option, payableAmount);
    },
    [selectTipForSplit, payableAmount]
  );

  return (
    <CheckoutContext
      value={{
        step: state.step,
        tip: state.tip,
        payment: state.payment,
        split: state.split,
        grandTotal,
        payableAmount,
        setStep,
        selectTip: selectTipWrapped,
        setCustomTip,
        startPayment,
        setSplitMode,
        setEqualHeadCount,
        toggleClaimItem,
        toggleSharedItem,
        setCustomAmount,
        clearSplit,
        reset,
      }}
    >
      {children}
    </CheckoutContext>
  );
}

/* ── Hook ── */

export function useCheckout(): CheckoutContextValue {
  const ctx = useContext(CheckoutContext);
  if (!ctx) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return ctx;
}
