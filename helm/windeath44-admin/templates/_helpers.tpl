{{/*
Expand the name of the chart.
*/}}
{{- define "windeath44-admin.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "windeath44-admin.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "windeath44-admin.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "windeath44-admin.labels" -}}
helm.sh/chart: {{ include "windeath44-admin.chart" . }}
{{ include "windeath44-admin.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "windeath44-admin.selectorLabels" -}}
app.kubernetes.io/name: {{ include "windeath44-admin.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "windeath44-admin.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "windeath44-admin.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create Istio Gateway name
*/}}
{{- define "windeath44-admin.gatewayName" -}}
{{- if .Values.istio.gateway.name }}
{{- .Values.istio.gateway.name }}
{{- else }}
{{- include "windeath44-admin.fullname" . }}-gateway
{{- end }}
{{- end }}

{{/*
Create Istio VirtualService name
*/}}
{{- define "windeath44-admin.virtualServiceName" -}}
{{- if .Values.istio.virtualService.name }}
{{- .Values.istio.virtualService.name }}
{{- else }}
{{- include "windeath44-admin.fullname" . }}-vs
{{- end }}
{{- end }}

{{/*
Create Istio DestinationRule name
*/}}
{{- define "windeath44-admin.destinationRuleName" -}}
{{- if .Values.istio.destinationRule.name }}
{{- .Values.istio.destinationRule.name }}
{{- else }}
{{- include "windeath44-admin.fullname" . }}-dr
{{- end }}
{{- end }}
