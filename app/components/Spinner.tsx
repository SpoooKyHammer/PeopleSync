import Image from "next/image";

import appIcon from "./../assets/chit-chat.png";

export default function Spinner() {
  return (
      <div className="flex items-center justify-center h-screen bg-base-100">
        <div className="relative w-24 h-24">
          <Image
            src={appIcon}
            alt="Loading"
            layout="fill"
            objectFit="contain"
            className="animate-spin"
            style={{ animationDuration: "1.5s" }}
          />
        </div>
      </div>
    );

}
