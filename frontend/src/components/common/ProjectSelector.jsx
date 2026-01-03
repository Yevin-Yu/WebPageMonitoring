import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

function ProjectSelector({ projects, selectedKey, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const selectedProject = projects.find(p => p.key === selectedKey);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (projectKey) => {
    onChange(projectKey);
    setIsOpen(false);
  };

  return (
    <div className="project-selector" ref={ref}>
      <button
        className="project-selector-button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        type="button"
      >
        <div className="project-selector-content">
          <span className="project-selector-icon">📊</span>
          <div className="project-selector-info">
            <div className="project-selector-name">
              {selectedProject?.name || '选择项目'}
            </div>
            {selectedProject && (
              <div className="project-selector-key">
                {selectedProject.key}
              </div>
            )}
          </div>
        </div>
        <span className={`project-selector-arrow ${isOpen ? 'open' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="project-selector-dropdown">
          <div className="project-selector-list">
            {projects.map((project) => (
              <button
                key={project.key}
                className={`project-selector-item ${project.key === selectedKey ? 'active' : ''}`}
                onClick={() => handleSelect(project.key)}
                type="button"
              >
                <div className="project-selector-item-content">
                  <div className="project-selector-item-icon">
                    {project.key === selectedKey ? '✓' : '📊'}
                  </div>
                  <div className="project-selector-item-info">
                    <div className="project-selector-item-name">
                      {project.name}
                    </div>
                    <div className="project-selector-item-key">
                      {project.key}
                    </div>
                    {project.description && (
                      <div className="project-selector-item-description">
                        {project.description}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

ProjectSelector.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  selectedKey: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

ProjectSelector.defaultProps = {
  selectedKey: '',
  disabled: false,
};

export default ProjectSelector;
