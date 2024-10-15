import React from 'react'
import './loader.scss'
import { Spin } from 'antd';
export default function Loader() {
  return (
    <div className='loader'>
        <Spin size="large" tip="Loading...">

</Spin>,
    </div>
  )
}
