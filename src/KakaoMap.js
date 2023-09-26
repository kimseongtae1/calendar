import React, { useEffect } from 'react';

export function KakaoMap(props) {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${'81bfa703c1f594a435bfcfac96cb7d0e'}&libraries=services,clusterer&autoload=false`;
    document.head.appendChild(script);

    script.addEventListener('load', () => {
      if (props.latitude != null && props.longitude != null) {
        window.kakao.maps.load(() => {
          const container = document.getElementById('map');
          const options = {
            center: new window.kakao.maps.LatLng(props.latitude, props.longitude),
            level: 3,
          };
          const map = new window.kakao.maps.Map(container, options);

          // 클러스터러를 생성합니다.
          const clusterer = new window.kakao.maps.MarkerClusterer({
            map: map,
            averageCenter: true,
            minLevel: 10, // 클러스터가 표시되는 최소 줌 레벨
          });

          // 마커 생성 및 설정
          const markers = props.markers.map((markerInfo) => {
            const markerPosition = new window.kakao.maps.LatLng(markerInfo.latitude, markerInfo.longitude);
            const marker = new window.kakao.maps.Marker({
              position: markerPosition,
            });
            marker.setMap(map);

            return marker;
          });

          // 클러스터러에 마커들을 추가합니다.
          clusterer.addMarkers(markers);
        });
      }
    });
  }, [props.latitude, props.longitude, props.markers]);

  return <div id="map" style={{ width: '100%', height: '400px' }}></div>;
}
