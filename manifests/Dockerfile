# Stage 1: MongoDB
FROM mongo:7.0.10-rc0-jammy AS mongo_stage

# Stage 2: Nginx
FROM nginx:stable-perl AS nginx_stage

# Stage 3: Python
FROM python:3.9 AS python_stage

# Stage 4: MySQL
FROM mysql:8.0.37-debian AS mysql_stage

# Stage 5: PostgreSQL
FROM postgres:bullseye AS postgres_stage

# Stage 6: PHP
FROM php:zts-bullseye AS php_stage


# FROM komljen/nodejs

# ARG ARG_IMAGE=alpine
# ARG ARG_TAG=3.9.5
# ARG ARG_NODE_TAG=14
# FROM scratch
# FROM ubuntu
# FROM ubuntu:latest
# FROM ubuntu:latest as builder2
# FROM node:14 AS app
# FROM node:$ARG_NODE_TAG
# FROM --platform=linux/amd64 alpine:latest
# FROM --platform=linux/amd64 python:${ARG_TAG}-${ARG_IMAGE} as Hello_there
# FROM mariadb:latest as db
# FROM registry.access.redhat.com/ubi9/nodejs-20 as builder
# FROM registry.access.redhat.com/ubi9/nodejs-20-minimal
# FROM $ARG_IMAGE