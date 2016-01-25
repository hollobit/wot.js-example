#!/bin/bash

dtc -O dtb -o BB-W1-00A0.dtbo -b 0 -@ w1.dts
cp ./BB-W1-00A0.dtbo /lib/firmware
cp ./capemgr /etc/default