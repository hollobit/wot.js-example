# Bluetooth 활성화
다음의 명령어를 이용하여 Bluetooth를 활성화 합니다.

```
$ rfkill unblock bluetooth
$ hciconfig hci0 up
```

아래의 그림은 활성화 이후 `rfkill list` 명령어로 활성화 여부를 확인한 결과 입니다.
![](https://docs.google.com/uc?id=0B02RRVY3KrmedV9sY0ZndkdNU2c)

# 고정 아이피 설정 방법
`/etc/wpa_supplicant/wpa_cli-actions.sh` 파일의 46~49라인을 다음과 같이 변경합니다.  

```
if [ "$CMD" = "CONNECTED"]; then
    kill deamon_udhcpc /var/run/udhcpc-$IFNAME.pid
    #udhcpc -i $IFNAME -p /var/run/udhcpc-$IFNAME.pid -S
    ifconfig $IFNAME 192.168.xxx.xxx netmask 255.255.255.0
    route add default gw 192.168.xxx.1
fi
```

같은 경로에 존재하는 `wpa_supplicant.conf` 파일을 다음과 같이 수정합니다.

```
ctrl_interface=/var/run/wpa_supplicant
ctrl_interface_group=0
config_methods=virtual_push_button virtual_display push_button keypad
update_config=1
fast_reauth=1
device_name=Edison
manufacturer=Intel
model_name=Edison

network={
  ssid="SSID명"
  key_mgmt=WPA-PSK
  pairwise=CCMP TKIP
  group=CCMP TKIP WEP104 WEP40
  eap=TTLS PEAP TLS
  psk="비밀번호"
}
```