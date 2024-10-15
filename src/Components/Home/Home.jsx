import React from 'react'
import LandingHeader from '../LandingHeader/LandingHeader'
import PopularCampaignsContainer from '../PopularCampaigns/PopularCampaignsContainer'

export default function Home({contract}) {
  return (
    <div>
        <LandingHeader/>
        <PopularCampaignsContainer contract={contract} />
    </div>
  )
}
