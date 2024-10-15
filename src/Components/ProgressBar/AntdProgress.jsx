import React from 'react'
import { Progress } from "antd";
import './antd.scss'
export default function AntdProgress({percent=0,textposition=0, status,  ...props}) {
  return (
    <div {...props} className='antd_progress_bar_container'>
           <Progress
          strokeColor={{
            from: "#4cc899",
            to: "#4cc899",
          }}
          percent={percent}
          status = {status}
        />
        <p style={{left: `${percent-textposition-2}%`}} className='title_text'>{`${percent.toFixed(0)}%`}</p>
    </div>
  )
}
