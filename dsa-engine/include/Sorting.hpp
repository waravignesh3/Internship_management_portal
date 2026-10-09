#ifndef SORTING_HPP
#define SORTING_HPP

#include <vector>
#include <functional>

template <typename T>
class AlgorithmsSort {
private:
    static void merge(std::vector<T>& arr, int left, int mid, int right, const std::function<bool(const T&, const T&)>& comp) {
        int n1 = mid - left + 1;
        int n2 = right - mid;

        std::vector<T> L(n1);
        std::vector<T> R(n2);

        for (int i = 0; i < n1; i++) L[i] = arr[left + i];
        for (int j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

        int i = 0, j = 0, k = left;
        while (i < n1 && j < n2) {
            if (comp(L[i], R[j])) {
                arr[k] = L[i];
                i++;
            } else {
                arr[k] = R[j];
                j++;
            }
            k++;
        }

        while (i < n1) {
            arr[k] = L[i];
            i++;
            k++;
        }
        while (j < n2) {
            arr[k] = R[j];
            j++;
            k++;
        }
    }

    static void mergeSortInternal(std::vector<T>& arr, int left, int right, const std::function<bool(const T&, const T&)>& comp) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSortInternal(arr, left, mid, comp);
            mergeSortInternal(arr, mid + 1, right, comp);
            merge(arr, left, mid, right, comp);
        }
    }

    static int partition(std::vector<T>& arr, int low, int high, const std::function<bool(const T&, const T&)>& comp) {
        T pivot = arr[high];
        int i = (low - 1);

        for (int j = low; j <= high - 1; j++) {
            if (comp(arr[j], pivot)) {
                i++;
                std::swap(arr[i], arr[j]);
            }
        }
        std::swap(arr[i + 1], arr[high]);
        return (i + 1);
    }

    static void quickSortInternal(std::vector<T>& arr, int low, int high, const std::function<bool(const T&, const T&)>& comp) {
        if (low < high) {
            int pi = partition(arr, low, high, comp);
            quickSortInternal(arr, low, pi - 1, comp);
            quickSortInternal(arr, pi + 1, high, comp);
        }
    }

public:
    static void mergeSort(std::vector<T>& arr, const std::function<bool(const T&, const T&)>& comp) {
        if (!arr.empty()) {
            mergeSortInternal(arr, 0, arr.size() - 1, comp);
        }
    }

    static void quickSort(std::vector<T>& arr, const std::function<bool(const T&, const T&)>& comp) {
        if (!arr.empty()) {
            quickSortInternal(arr, 0, arr.size() - 1, comp);
        }
    }
};

#endif
