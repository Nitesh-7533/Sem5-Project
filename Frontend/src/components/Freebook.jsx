import React, { useEffect, useState } from "react";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Card from "../components/Cards"
import axios from "axios";
import list from "../../public/list.json";

function Freebook() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // sirf Free category
    const freeBooks = list.filter((item) => item.category === "Free");
    setBooks(freeBooks);
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 py-10">

      <h1 className="text-2xl font-semibold mb-14 rounded-full bg-red-500 flex justify-center ">Free Books </h1>
     

      <Slider {...settings}>
        {books.map((item) => (
          <div key={item.id}>
          
            
              <Card item={item} key={item.id}/>
              
           
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default Freebook;
