import{r as p,j as t,L as m}from"./index-Cg-pIFFT.js";import{S as x,A as h,N as b,P as u,a as g}from"./pagination-ChAglbSL.js";const w="https://hoodshop-project.onrender.com",y=({slides:n,handleAddToCart:l})=>{const[c,o]=p.useState([]),d=async e=>{o(s=>[...s,e.id]);try{await l(e)}catch{alert("Chyba pri pridávaní do košíka")}finally{o(s=>s.filter(i=>i!==e.id))}};return t.jsxs(t.Fragment,{children:[t.jsx(x,{modules:[h,b,u],loop:!0,autoplay:{delay:6e3,disableOnInteraction:!1},speed:1e3,navigation:!0,pagination:{clickable:!0},spaceBetween:20,breakpoints:{320:{slidesPerView:1},640:{slidesPerView:2},768:{slidesPerView:3},1024:{slidesPerView:4},1280:{slidesPerView:5},1536:{slidesPerView:6}},className:"w-full h-[420px] relative z-20",children:n.map((e,s)=>{const i=e.name.toLowerCase().replace(/\s+/g,"-"),r=c.includes(e.id);let a=e.image;return a.startsWith("https//")&&(a=a.replace("https//","https://")),a.startsWith("http")||(a=`${w}${a}`),t.jsx(g,{children:t.jsxs("div",{className:"w-full h-full bg-gray-100 flex flex-col items-center justify-start p-4 text-center hover:shadow-xl transition relative",children:[t.jsxs(m,{to:`/product/${i}`,className:"flex-grow hover:brightness-110",children:[t.jsx("h2",{className:"text-lg font-bold mb-1 text-black",children:e.name}),t.jsx("p",{className:"text-sm text-gray-600 mb-2",children:e.brand}),t.jsx("img",{src:a,alt:e.name,className:"h-[240px] mb-2 transition duration-300"}),t.jsxs("p",{className:"text-green-600 text-xl font-semibold mb-1",children:[e.price," €"]})]}),t.jsx("button",{onClick:()=>d(e),disabled:r,className:`mt-2 w-full py-2 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-600 transition ${r?"opacity-50 cursor-not-allowed":""}`,children:r?"Pridávam...":"Add to Cart"})]})},s)})}),t.jsx("style",{children:`
        .swiper-pagination-bullet {
          background-color: #d1d5db; 
          opacity: 1;
          width: 12px;
          height: 12px;
          margin: 6px;
          transition: background-color 0.3s ease;
        }

        .swiper-pagination-bullet-active {
          background-color: #2563eb;
        }

        .swiper-pagination {
          bottom: -5px !important;
          z-index: 20; 
          position: absolute; 
        }
      `})]})};export{y as P};
