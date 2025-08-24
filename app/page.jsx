import Image from "next/image";
import TextArea from "./components/TextArea";
import Card from "./components/Card";

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-[#282828]">
      <div className="">
        <div className="wrapper flex justify-center py-[80px]">
          <h1 className="text-[1.5em] z-20">yourfine</h1>
        </div>
      </div>
      <div className="  flex-1">
        <div className="mx-[550px] flex flex-col items-center gap-4 h-full px-4">
          <div className="w-full relative " id="wrapper-cards" >
            <div
              id="cards"
              className=" w-full  flex flex-col gap-3 h-[500px] overflow-y-scroll pb-2 pt-2 relative"
            >
              <Card />
              <Card />
              <Card />
              <Card />
            </div>
            <div id="shadowing-top"></div>
          </div>

          <TextArea />
        </div>
      </div>
    </div>
  );
}
