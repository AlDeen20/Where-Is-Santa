import Head from 'next/head';

import Layout from '@components/Layout';
import Section from '@components/Section';
import Container from '@components/Container';
import Map from '@components/Map';
import Button from '@components/Button';

import styles from '@styles/Home.module.scss';


import useSWR from 'swr'


const DEFAULT_CENTER = [38.907132, -77.036546]
const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function Home() {
  //fetching where is santa location
  const { data, error, isLoading } = useSWR('https://firebasestorage.googleapis.com/v0/b/santa-tracker-firebase.appspot.com/o/route%2Fsanta_en.json?alt=media&2018b', fetcher)
//console.log(data);
    const currentDate= new Date(Date.now());
    const currentYear=currentDate.getFullYear();
    
    const destinations= data?.destinations.map(destinations=>{
    const {arrival, departure}=destinations;
    
    const arrivalDate=new Date(arrival);
    const departureDate=new Date(departure);

    arrivalDate.setFullYear(currentYear)
    departureDate.setFullYear(currentYear)
    return {
        ...destinations,
        arrival:arrivalDate.getTime(),
        departure:departureDate.getTime()
    }
  })

  return (
    <Layout>
      <Head>
        <title>Where Is Santa Now?</title>
        <meta name="description" content="Where is Santa Now?" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section>
        <Container>
          <h1 className={styles.title}>
            Where Is Santa Now?
          </h1>

          <Map className={styles.homeMap} width="800" height="400" center={[0,0]} zoom={1.5}>
            {({ TileLayer, Marker, Popup }, Leaflet) => (
              <>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />
                {destinations?.map(({id, location, city, region, arrival, departure})=>{
                  const arrivalDate=new Date(arrival);
                  const arrivalHours=arrivalDate.getHours();
                  const arrivalMINUTES=arrivalDate.getMinutes();
                  const currentArrival=`${arrivalHours}:${arrivalMINUTES}`;

                  const departureDate=new Date(departure);
                  const adepartureHours=departureDate.getHours();
                  const departureMINUTES=departureDate.getMinutes();
                  const currentDeparture=`${adepartureHours}:${departureMINUTES}`;
                  const santaGift= currentDate.getTime()-departureDate.getTime()>0

                  const santaComing=currentDate.getTime()-departureDate.getTime()>0 && !santaGift;
                  let iconUrl=santaGift? 'https://cdn-icons-png.flaticon.com/512/9141/9141600.png':'https://cdn-icons-png.flaticon.com/512/6235/6235300.png';
                  let iconRetinalUrl= santaComing? 'https://cdn-icons-png.flaticon.com/512/6235/6235300.png':'https://cdn-icons-png.flaticon.com/512/9141/9141600.png';
                
                  return (
                    <Marker 
                    key={id} 
                    position={[location.lat, location.lng]}
                    icon={
                      Leaflet.icon({
                       iconUrl,
                       iconRetinalUrl,
                       iconSize:[25,25]
                       
                      })
                    }
                    >
                  <Popup>
                    {city}, {region}
                    <br />
                    Arrival {arrivalDate.toDateString()} At {currentArrival}
                    <br />
                    departure {departureDate.toDateString()} At {currentDeparture}
                  </Popup>
                </Marker>
                  )
                })}
                
              </>
            )}
          </Map>



          <p className={styles.view}>
            <Button href="https://github.com/AlDeen20/tracking-santa">Vew on GitHub</Button>
          </p>
        </Container>
      </Section>
    </Layout>
  )
}
