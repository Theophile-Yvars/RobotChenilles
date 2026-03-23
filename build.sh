#!/bin/bash

source /opt/ros/jazzy/setup.bash
cd /home/robot_ws
colcon build --symlink-install --parallel-workers 4