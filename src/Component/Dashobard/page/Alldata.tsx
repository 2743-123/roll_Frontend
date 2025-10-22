import BalanceCard from "./balance";
import PendingBedash from "./pendingBedash";
import PendingTokens from "./pendingToken";

const AllData = () => {
  return (
    <div>
      <PendingTokens />
      <BalanceCard />
      <PendingBedash/>
    </div>
  );
};
export default AllData;
