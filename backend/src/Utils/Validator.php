<?php

namespace App\Utils;

class Validator
{
    private $data;
    private $errors = [];

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function required($fields)
    {
        $fields = is_array($fields) ? $fields : [$fields];

        foreach ($fields as $field) {
            if (!isset($this->data[$field]) || empty($this->data[$field])) {
                $this->errors[$field] = "El campo $field es requerido";
            }
        }

        return $this;
    }

    public function email($field)
    {
        if (isset($this->data[$field]) && !filter_var($this->data[$field], FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = "El campo $field debe ser un email válido";
        }

        return $this;
    }

    public function numeric($field)
    {
        if (isset($this->data[$field]) && !is_numeric($this->data[$field])) {
            $this->errors[$field] = "El campo $field debe ser numérico";
        }

        return $this;
    }

    public function length($field, $min, $max = null)
    {
        if (isset($this->data[$field])) {
            $length = strlen($this->data[$field]);

            if ($length < $min) {
                $this->errors[$field] = "El campo $field debe tener al menos $min caracteres";
            }

            if ($max && $length > $max) {
                $this->errors[$field] = "El campo $field no puede tener más de $max caracteres";
            }
        }

        return $this;
    }

    public function match($field1, $field2)
    {
        if (isset($this->data[$field1]) && isset($this->data[$field2])) {
            if ($this->data[$field1] !== $this->data[$field2]) {
                $this->errors[$field2] = "Los campos $field1 y $field2 no coinciden";
            }
        }

        return $this;
    }

    public function in($field, $values)
    {
        if (isset($this->data[$field]) && !in_array($this->data[$field], $values)) {
            $this->errors[$field] = "El campo $field tiene un valor inválido";
        }

        return $this;
    }

    public function unique($table, $field, $exceptId = null)
    {
        if (isset($this->data[$field])) {
            $db = \App\Services\DatabaseService::getInstance();

            $query = "SELECT COUNT(*) as count FROM $table WHERE $field = ?";
            $params = [$this->data[$field]];

            if ($exceptId) {
                $query .= " AND id != ?";
                $params[] = $exceptId;
            }

            $result = $db->query($query, $params)->fetch();

            if ($result['count'] > 0) {
                $this->errors[$field] = "El $field ya está en uso";
            }
        }

        return $this;
    }

    public function passes()
    {
        return empty($this->errors);
    }

    public function errors()
    {
        return $this->errors;
    }
}
