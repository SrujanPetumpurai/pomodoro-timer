const totalCycles = 4;
export default function Cycle({completedCycles=0}:{completedCycles:number}){
    return(
        <div className="bg-gray-100 flex items-centered justify-between rounded-xl w-full items-center px-2">
            <span className="text-gray-400 font-bold">CYCLE:</span>
            <span className="text-gray-400 font-bold">{completedCycles}</span>
            <div className="flex">
                {Array.from({length:totalCycles}).map((_,idx)=>{
                    return(
                        <img key={idx} className="w-14 h-14" src={idx<completedCycles?'/red_tomato.png':'/gray_tomato.png'} alt={idx <completedCycles ? "Completed cycle" : "Pending cycle"} />
                    )
                })}
            </div>
        </div>
    )
}