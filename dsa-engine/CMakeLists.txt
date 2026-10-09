cmake_minimum_required(VERSION 3.10)
project(InternHubDSAEngine CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

file(GLOB_RECURSE SOURCES "src/*.cpp")

add_executable(dsa_engine ${SOURCES})

if (WIN32)
    target_link_libraries(dsa_engine ws2_32)
endif()
