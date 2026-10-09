#ifndef SEARCHING_HPP
#define SEARCHING_HPP

#include <vector>
#include <functional>
#include <string>

template <typename T>
class AlgorithmsSearch {
public:
    static int linearSearch(const std::vector<T>& arr, const std::function<bool(const T&)>& predicate) {
        for (size_t i = 0; i < arr.size(); ++i) {
            if (predicate(arr[i])) {
                return (int)i;
            }
        }
        return -1;
    }

    static int binarySearch(const std::vector<T>& arr, const T& target, const std::function<int(const T&, const T&)>& comparator) {
        int low = 0;
        int high = (int)arr.size() - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            int res = comparator(arr[mid], target);
            if (res == 0) return mid;
            if (res < 0) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
};

#endif
