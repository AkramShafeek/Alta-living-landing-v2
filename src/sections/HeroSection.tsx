import { Button3D } from '@/pages/Home';
import React from 'react'

const HeroSection = () => {
  return (
    <div className="w-full h-full grid grid-cols-[1fr_2fr_auto_7fr_2fr] grid-rows-[96px_1fr_200px_100px] gap-px bg-[#D3BFA1] rounded-lg overflow-hidden">
      <div className="bg-[#E8DCC6]"></div>
      <div className="bg-[#E8DCC6]"></div>
      <div className="bg-[#E8DCC6]"></div>
      <div className="bg-[#E8DCC6]"></div>
      <div className="bg-[#E8DCC6]"></div>

      <div className="bg-[#E8DCC6]"></div>
      <div className="bg-[#E8DCC6] flex flex-col justify-end items-end pb-4">
        <p className='text-7xl font-extrabold'>ALTA</p>
      </div>
      <div className="bg-[#E8DCC6] flex flex-col justify-end items-start pb-4">
        <p className='text-7xl font-extrabold cursor-vertical-text [writing-mode:vertical-rl] rotate-180 mb-2'>LIVING</p>
      </div>
      <div className="bg-[#E8DCC6] flex justify-center items-end pb-10">
        <Button3D
          variant="primary"
          size="md"
          className="z-20"
          onClick={() => {
            console.log('Button clicked!');
          }}
        >
          Browse Properties
        </Button3D>
      </div>
      <div className="bg-[#E8DCC6] flex flex-col p-4 gap-4">
        <div className="bg-[#D3BFA1] w-full h-full rounded-lg"></div>
        <div className="bg-[#D3BFA1] w-full h-full rounded-lg"></div>
      </div>

      <div className="bg-[#E8DCC6]"></div>
      <div className="bg-[#E8DCC6]"></div>
      <div className="bg-[#E8DCC6]"></div>
      <div className="bg-[#E8DCC6]"></div>
      <div className="bg-[#E8DCC6]"></div>

      <div className="bg-[#E8DCC6]"></div>
      <div className="bg-[#E8DCC6]"></div>
      <div className="bg-[#E8DCC6]"></div>
      <div className="bg-[#E8DCC6]"></div>
      <div className="bg-[#E8DCC6]"></div>
    </div>
  )
}

export default HeroSection