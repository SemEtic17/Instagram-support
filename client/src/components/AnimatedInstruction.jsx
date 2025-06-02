
import React from 'react';

const AnimatedInstruction = ({ instruction }) => {
  const getInstructionAnimation = (instruction) => {
    const baseClasses = "w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-2xl transition-transform duration-500";
    
    switch (instruction) {
      case "Turn your head to the left":
        return {
          classes: `${baseClasses} animate-pulse`,
          icon: "👈",
          animation: "animate-[wiggle_1s_ease-in-out_infinite]"
        };
      case "Turn your head to the right":
        return {
          classes: `${baseClasses} animate-pulse`,
          icon: "👉",
          animation: "animate-[wiggle_1s_ease-in-out_infinite]"
        };
      case "Smile naturally":
        return {
          classes: `${baseClasses} animate-bounce`,
          icon: "😊",
          animation: "animate-[pulse_1.5s_ease-in-out_infinite]"
        };
      case "Blink twice slowly":
        return {
          classes: `${baseClasses}`,
          icon: "👁️",
          animation: "animate-[blink_2s_ease-in-out_infinite]"
        };
      case "Nod your head up and down":
        return {
          classes: `${baseClasses}`,
          icon: "👆",
          animation: "animate-[nod_1.5s_ease-in-out_infinite]"
        };
      case "Look up at the ceiling":
        return {
          classes: `${baseClasses} animate-pulse`,
          icon: "⬆️",
          animation: "animate-[lookUp_2s_ease-in-out_infinite]"
        };
      case "Look down at the floor":
        return {
          classes: `${baseClasses} animate-pulse`,
          icon: "⬇️",
          animation: "animate-[lookDown_2s_ease-in-out_infinite]"
        };
      case "Open your mouth slightly":
        return {
          classes: `${baseClasses} animate-pulse`,
          icon: "😮",
          animation: "animate-[mouth_1.5s_ease-in-out_infinite]"
        };
      default:
        return {
          classes: baseClasses,
          icon: "👤",
          animation: ""
        };
    }
  };

  const instructionData = getInstructionAnimation(instruction);

  return (
    <div className="text-center">
      <div className={`${instructionData.classes} ${instructionData.animation}`}>
        <span className="text-2xl">{instructionData.icon}</span>
      </div>
      <p className="text-purple-800 font-semibold text-lg mb-2">{instruction}</p>
      <div className="w-full bg-purple-100 rounded-full h-1 mb-4">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full animate-pulse w-full"></div>
      </div>
    </div>
  );
};

export default AnimatedInstruction;
