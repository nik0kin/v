#!/bin/bash

tr -d '\n' < $1 > $1.copy
rm $1
mv $1.copy $1
