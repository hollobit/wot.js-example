# WoT.js Demo
[W3C TPAC 2015](http://www.w3.org/2015/10/TPAC/)와 [IoT Week 2015](http://www.iotweek.kr/2015/intro/intro.asp)에 전시 및 시연된 WoT.js 기반 데모 어플리케이션 입니다.  

## 배치 및 구조
![Demo image](https://docs.google.com/uc?id=0B02RRVY3KrmeVHhIcUZIOE9iX3c)
데모는 거실의 Intel Edison + Arduino 보드를 통해 각 보드가 장착되어 있는 센서 및 엑츄에이터를 통해 수치 수집 및 엑츄에이터 제어를 제어하며 WPx(WebPlugin) 시스템과 연동하여 각 보드의 데이터를 취합 및 각 보드별 엑츄에이터를 외부에서 제어할 수 있습니다.

## 폴더 구조

```bash
.
├── bbb_init
├── ble_scan
├── coex_bbb_room
├── coex_edison_gateway
├── coex_rb_enterence
├── coex_rb_room
├── edison_init
├── tpac_bbb_room
├── tpac_edison_gateway
├── tpac_rb_enterence
└── tpac_rb_room
```

1. bbb_init  
BBB(Beaglebone Black)의 W1 사용을 위한 초기 설정 shell script가 위치합니다.

2. codex_bbb_room  
IoT Week 2015용 Beaglebone Black에 적용된 application으로 다음 4가지의 센서를 장착하고 있습니다. 시연시 사용한 cape 정보는 [NeuroMeka](http://wiki.neuromeka.net/index.php?title=SensorCape)에서 확인하실 수 있습니다.  
[README 확인](./tree/master/coex_bbb_room)

3. coex_edison_gateway

Intel Edison + Arduino 쉴드에 BH1750 조도 센서를 장착하였습니다. 

