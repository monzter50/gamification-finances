import { useAuth } from "@/context/AuthContext";

import { SessionBlockedScreen } from "./SessionBlockedScreen";

/**
 * Bridges AuthContext's `sessionBlock` state to the blocking overlay. Mounted
 * once at the app root (above the router) so the overlay covers all routed
 * content. Renders nothing when there's no active block.
 */
export const SessionBlockedGate = () => {
  const { sessionBlock, dismissSessionBlock } = useAuth();

  if (!sessionBlock) { return null; }

  return <SessionBlockedScreen reason={sessionBlock} onDismiss={dismissSessionBlock} />;
};
