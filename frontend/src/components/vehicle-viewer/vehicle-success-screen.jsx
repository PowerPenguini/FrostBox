import { motion, useAnimation } from "framer-motion";
import { IconCircleCheck, IconArrowRight } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useVehicleViewer } from "@/state/vehicle-viewer-context";
import { Button } from "../ui/button";

export function SuccessScreen() {
  const controls = useAnimation();
  const [buttonVisible, setButtonVisible] = useState(false);
  const { pop } = useVehicleViewer();

  const onFinish = () => {
    pop();
  };
  useEffect(() => {
    if (buttonVisible) {
      controls.start({
        width: "100%",
        transition: { duration: 3, ease: "linear" },
      });

      const timer = setTimeout(() => {
        onFinish();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [buttonVisible, controls]);

  return (
    <div className="flex flex-col justify-center items-center h-full text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <IconCircleCheck className="w-20 h-20 text-green-500" />
      </motion.div>

      <motion.h2
        className="mt-6 font-bold text-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Wszystko gotowe!
      </motion.h2>

      <motion.p
        className="mt-3 text-muted-foreground"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Serwis został zapisany pomyślnie 🎉
      </motion.p>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        onAnimationComplete={() => setButtonVisible(true)}
      >
        <Button size="lg" className="relative" onClick={onFinish}>
          Zakończ <IconArrowRight />
          <motion.div
            className="top-0 left-0 absolute bg-gray-300/20 h-full"
            initial={{ width: 0 }}
            animate={controls}
          />
        </Button>
      </motion.div>
    </div>
  );
}
