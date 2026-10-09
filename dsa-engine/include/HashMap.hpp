#ifndef HASHMAP_HPP
#define HASHMAP_HPP

#include <iostream>
#include <vector>
#include <string>
#include <stdexcept>
#include <utility>

template <typename K, typename V>
class CustomHashMap {
private:
    struct Node {
        K key;
        V value;
        Node* next;
        Node(K k, V v) : key(k), value(v), next(nullptr) {}
    };

    std::vector<Node*> table;
    size_t capacity;
    size_t num_elements;

    size_t hashFunction(const K& key) const {
        std::hash<K> hasher;
        return hasher(key) % capacity;
    }

    void rehash() {
        size_t oldCapacity = capacity;
        std::vector<Node*> oldTable = table;

        capacity *= 2;
        table.assign(capacity, nullptr);
        num_elements = 0;

        for (size_t i = 0; i < oldCapacity; ++i) {
            Node* current = oldTable[i];
            while (current) {
                insert(current->key, current->value);
                Node* temp = current;
                current = current->next;
                delete temp;
            }
        }
    }

public:
    CustomHashMap(size_t initial_capacity = 16) : capacity(initial_capacity), num_elements(0) {
        table.assign(capacity, nullptr);
    }

    ~CustomHashMap() {
        for (size_t i = 0; i < capacity; ++i) {
            Node* current = table[i];
            while (current) {
                Node* temp = current;
                current = current->next;
                delete temp;
            }
        }
    }

    void insert(const K& key, const V& value) {
        if ((double)(num_elements + 1) / capacity > 0.75) {
            rehash();
        }

        size_t index = hashFunction(key);
        Node* current = table[index];

        while (current) {
            if (current->key == key) {
                current->value = value;
                return;
            }
            current = current->next;
        }

        Node* newNode = new Node(key, value);
        newNode->next = table[index];
        table[index] = newNode;
        num_elements++;
    }

    bool get(const K& key, V& out_val) const {
        size_t index = hashFunction(key);
        Node* current = table[index];

        while (current) {
            if (current->key == key) {
                out_val = current->value;
                return true;
            }
            current = current->next;
        }
        return false;
    }

    bool contains(const K& key) const {
        V dummy;
        return get(key, dummy);
    }

    bool remove(const K& key) {
        size_t index = hashFunction(key);
        Node* current = table[index];
        Node* prev = nullptr;

        while (current) {
            if (current->key == key) {
                if (prev) {
                    prev->next = current->next;
                } else {
                    table[index] = current->next;
                }
                delete current;
                num_elements--;
                return true;
            }
            prev = current;
            current = current->next;
        }
        return false;
    }

    size_t size() const { return num_elements; }
};

#endif
