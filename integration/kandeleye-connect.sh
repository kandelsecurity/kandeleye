#!/bin/bash
# KANDELeye Connector — Script para enviar datos de herramientas KANDEL
# Uso: kandeleye-connect.sh <source> <action> <json-data>
# 
# Sources: kandelscan, kandelcrack, kandellimiter, kandelker
# Actions: vulnerability, network, device, gps, audit-start, audit-complete
#
# Ejemplo:
#   kandeleye-connect.sh kandelscan vulnerability '{"target":"192.168.1.1","severity":"critical","port":80}'

SOURCE="$1"
ACTION="$2"
DATA="$3"
API_URL="${KANDELYE_API:-http://localhost:3000/api/integration}"

curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"source\":\"$SOURCE\",\"action\":\"$ACTION\",\"data\":$DATA}"
