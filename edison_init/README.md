# Bluetooth 활성화
다음의 명령어를 이용하여 Bluetooth를 활성화 합니다.

```
$ rfkill unblock bluetooth
$ hciconfig hci0 up
```

아래의 그림은 활성화 이후 `rfkill list` 명령어로 활성화 여부를 확인한 결과 입니다.
![](https://docs.google.com/uc?id=0B02RRVY3KrmedV9sY0ZndkdNU2c)

# I2C 활성화
다음의 명령어를 이용하여 활성화 합니다.

```
echo 28 > /sys/class/gpio/export 
echo 27 > /sys/class/gpio/export 
echo 204 > /sys/class/gpio/export 
echo 205 > /sys/class/gpio/export 
echo 236 > /sys/class/gpio/export 
echo 237 > /sys/class/gpio/export 
echo 14 > /sys/class/gpio/export 
echo 165 > /sys/class/gpio/export 
echo 212 > /sys/class/gpio/export 
echo 213 > /sys/class/gpio/export 
echo 214 > /sys/class/gpio/export 
echo low > /sys/class/gpio/gpio214/direction 
echo low > /sys/class/gpio/gpio204/direction 
echo low > /sys/class/gpio/gpio205/direction 
echo in > /sys/class/gpio/gpio14/direction 
echo in > /sys/class/gpio/gpio165/direction 
echo low > /sys/class/gpio/gpio236/direction 
echo low > /sys/class/gpio/gpio237/direction 
echo in > /sys/class/gpio/gpio212/direction 
echo in > /sys/class/gpio/gpio213/direction 
echo mode1 > /sys/kernel/debug/gpio_debug/gpio28/current_pinmux 
echo mode1 > /sys/kernel/debug/gpio_debug/gpio27/current_pinmux 
echo high > /sys/class/gpio/gpio214/direction
```

# Bluetooth, I2C 활성화 스크립트
첨부되어 있는 **run.sh** 파일을 (아닐경우) root 권한으로 실행합니다.  
만약 부팅시 자동 설정을 원할 경우 /etc/init.d 폴더에 해당 파일을 복사 후 실행권한(`chmod u+x,g+x,a+x run.sh`)을 부여합니다. 다음번 부팅시 부터는 해당 초기화 스크립트가 자동으로 실행됩니다.

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

설정이 완료된 후 재기동 합니다.

```
$ reboot
```