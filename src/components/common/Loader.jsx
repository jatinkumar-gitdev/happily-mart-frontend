import { Spiral } from "ldrs/react";
import "ldrs/react/Spiral.css";

export default function Loader() {
  return (
    <div>
      <Spiral size="60" speed="0.8" color="#3b86d1" />;
    </div>
  );
}
