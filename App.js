import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import { useState, useEffect } from 'react';
import dfs_xy_conv from './components/nxny'

const windowWidth = Dimensions.get('window').width;
const API_KEY = "SLw2uYcxFSzDJorh5xW%2FWvwq5d0zpXzlMMShHdqKRrq5dvV4LKjfrL0WyI7JJ6wjtvqdLI5v8ORAwAozC4xIvA%3D%3D"


export default function App() {

  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("Loading")
  const [details, setDetails] = useState(null);
  const [date, setDate] = useState(null);

  //위치 정보찾음!!! (도시, 동, 위도, 경도, 좌표x, 좌표y)
  const getLocation = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) { setLoading(true); }
    const { coords: { latitude, longitude } } = (await Location.getCurrentPositionAsync());
    const [{ city, district }] = await Location.reverseGeocodeAsync({ latitude, longitude })
    const { x, y } = await dfs_xy_conv("toXY", latitude, longitude);
    setLocation([city, district, latitude, longitude, x, y]);
    console.log("location 완료");
    const yyyymmdd = `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}`;
    setDate(yyyymmdd);
    console.log("date 완료");
  }
  useEffect(() => { getDetails(); }, [location, date])
  const getDetails = async () => {
    if ((date === null || location === "Loading")) { console.log(date, location, "다시"); setTimeout(getLocation, 4000); } else {
      console.log("detail 시작");
      console.log(`http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=${API_KEY}&dataType=JSON&numOfRows=1000&pageNo=1&base_date=${date}&base_time=0200&nx=${location[4]}&ny=${location[5]}`)
      const response = await fetch(`http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=${API_KEY}&dataType=JSON&numOfRows=1000&pageNo=1&base_date=${date}&base_time=0200&nx=${location[4]}&ny=${location[5]}`);
      const json = await response.json();
      console.log("수아", json.response.header.resultCode);

      if (json.response.header.resultCode === "00") {
        const data = json.response.body.items.item[0];
        const groupedData = data.reduce((acc, item) => {
          const { date, category, value } = item;
          if (!acc[date]) {
            acc[date] = {};
          } acc[date][category] = value;
          return acc;
        }, {});
        const result = Object.keys(groupedData).map(date => { [date, ...groupedData[date]] });
        setDetails(result);
        console.log("야호");
        setLoading(false);
      }
      else {
        console.log("재시도");
        setTimeout(() => getDetails, 4000);
      }
    }
  }
  useEffect(() => { getLocation(); }, []);

  /* 
    const =() => {
      days.map((day, index) => <View key={index} style={styles.day}>
        <Text style={styles.temp}>
          {parseFloat(day.main.temp).toFixed(1)}
        </Text>
        <Text style={styles.description}>{day.weather[0].main}</Text>
        <Text style={styles.tinyText}>{day.weather[0].description}
        </Text>
      </View>)
    } */


  return (loading ? <View style={styles.container}><Text style={styles.city_name}>Loading...</Text></View> :
    <View style={styles.container}>
      <View style={styles.city_container}>
        <Text style={styles.city_name}>
          {location[0]}
          {"\n"}
          {location[1]}
        </Text>
      </View>
      <View style={{ flex: 5 }}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.weather_container}>
          {details.map((detail, index) => <View key={index} style={styles.day}><Text>{detail.body.items.item[0]}</Text></View>)}




          <View style={styles.day}>
            <Text>18</Text>
            <Text>{details.body.items.item[0].category}</Text>
            <Text>{date}</Text>
          </View>
          <View style={styles.day}>
            <Text>18</Text>
            <Text>Cloudy</Text>
            <Text>8월6일</Text>
          </View><View style={styles.day}>
            <Text>18</Text>
            <Text>Cloudy</Text>
          </View><View style={styles.day}>
            <Text>18</Text>
            <Text>Cloudy</Text>
          </View>
        </ScrollView>
      </View>
      <StatusBar style="auto" />
    </View >
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  city_container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "grey",

  },
  city_name: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  weather_container: {
    flex: 5,

    backgroundColor: "beige"


  },
  day: {
    width: windowWidth,
    alignItems: "center",
    justifyContent: "center"
  }

});
