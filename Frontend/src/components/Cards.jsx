import React from "react";

function Cards({ item }) {
  return (
    <>
      <div className="card-body flex flex-col justify-between ">
        <div className="card w-80 md:w-72 h-[420px] bg-base-100 shadow-xl hover:scale-105 duration-200 dark:bg-slate-900 dark:text-white dark:border">
  <figure>
    <img src={item.images} alt="Photos" className="h-48 w-full object-cover" />
  </figure>
  <div className="card-body">
    <h2 className="card-title flex flex-col items-start gap-1">
      {item.name}
      <div className="badge badge-secondary">{item.category}</div>
    </h2>
    <p>{item.title}</p>
    <div className="card-actions justify-between">
      <div className="badge badge-outline">${item.price}</div>
      <div
  className={`cursor-pointer px-2 py-1 rounded-full border-[2px] duration-200 
  ${item.price === 0 
    ? "hover:bg-pink-500 hover:text-white" 
    : "hover:bg-green-500 hover:text-white"}`}
>
  {item.price === 0 ? "Free" : "Paid"}
</div>

    </div>
  </div>
</div>

      </div>
    </>
  );
}

export default Cards;
